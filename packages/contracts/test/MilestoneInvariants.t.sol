// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MilestoneVault} from "../src/MilestoneVault.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";

contract VaultHandler is Test {
    MilestoneVault public vault;
    MockUSDC public usdc;

    address[] public actors;
    address internal client;
    address internal contractor;

    constructor(MilestoneVault vault_, MockUSDC usdc_) {
        vault = vault_;
        usdc = usdc_;
        client = makeAddr("inv-client");
        contractor = makeAddr("inv-contractor");
        actors.push(client);
        actors.push(contractor);
        actors.push(makeAddr("inv-alice"));
        actors.push(makeAddr("inv-bob"));

        usdc.mint(client, type(uint128).max / 4);
    }

    function actor(uint256 seed) public view returns (address) {
        return actors[seed % actors.length];
    }

    function advanceTime(uint256 delta) external {
        vm.warp(block.timestamp + bound(delta, 0, 400 days));
    }

    function fund(uint256 actorSeed) external {
        if (vault.state() != MilestoneVault.State.Created) return;
        address a = actor(actorSeed);
        if (a != client) return;
        usdc.mint(a, vault.amount());
        vm.startPrank(a);
        usdc.approve(address(vault), vault.amount());
        vault.fundMilestone();
        vm.stopPrank();
    }

    function acknowledge(uint256 actorSeed) external {
        if (vault.state() != MilestoneVault.State.Funded) return;
        address a = actor(actorSeed);
        if (a != contractor) return;
        vm.prank(a);
        vault.acknowledgeStart();
    }

    function submit(uint256 actorSeed, uint256 seed) external {
        MilestoneVault.State s = vault.state();
        if (
            s != MilestoneVault.State.Funded && s != MilestoneVault.State.Active
                && s != MilestoneVault.State.RevisionRequested
        ) return;
        address a = actor(actorSeed);
        if (a != contractor) return;
        vm.prank(a);
        vault.submitWork(
            keccak256(abi.encode(seed, "evidence")),
            string.concat("https://example.com/evidence/", vm.toString(seed), ".json")
        );
    }

    function approve(uint256 actorSeed) external {
        MilestoneVault.State s = vault.state();
        if (s != MilestoneVault.State.Submitted && s != MilestoneVault.State.Disputed) return;
        address a = actor(actorSeed);
        if (a != client) return;
        vm.prank(a);
        vault.approveAndRelease();
    }

    function requestRevision(uint256 actorSeed, uint256 seed) external {
        if (vault.state() != MilestoneVault.State.Submitted) return;
        if (block.timestamp >= vault.reviewDeadline()) return;
        address a = actor(actorSeed);
        if (a != client) return;
        vm.prank(a);
        vault.requestRevision(keccak256(abi.encode(seed, "reason")));
    }

    function dispute(uint256 actorSeed) external {
        if (vault.state() != MilestoneVault.State.Submitted) return;
        if (block.timestamp >= vault.reviewDeadline()) return;
        address a = actor(actorSeed);
        if (a != client) return;
        vm.prank(a);
        vault.dispute();
    }

    function claim(uint256 actorSeed) external {
        if (vault.state() != MilestoneVault.State.Submitted) return;
        if (block.timestamp < vault.reviewDeadline()) return;
        vm.prank(actor(actorSeed));
        vault.claimAfterReview();
    }

    function refund(uint256 actorSeed) external {
        MilestoneVault.State s = vault.state();
        if (
            s != MilestoneVault.State.Funded && s != MilestoneVault.State.Active
                && s != MilestoneVault.State.RevisionRequested
        ) return;
        if (block.timestamp <= vault.submitDeadline()) return;
        address a = actor(actorSeed);
        if (a != client) return;
        vm.prank(a);
        vault.refundExpired();
    }

    function proposeCancel(uint256 actorSeed) external {
        MilestoneVault.State s = vault.state();
        if (
            s != MilestoneVault.State.Funded && s != MilestoneVault.State.Active
                && s != MilestoneVault.State.RevisionRequested && s != MilestoneVault.State.Disputed
        ) return;
        address a = actor(actorSeed);
        if (a != client && a != contractor) return;
        vm.prank(a);
        vault.proposeMutualCancel();
    }
}

contract MilestoneInvariants is Test {
    VaultHandler public handler;
    MilestoneVault public vault;
    MockUSDC public usdc;

    bool public ghost_terminalObserved;

    function setUp() public {
        usdc = new MockUSDC();
        vault = new MilestoneVault(
            makeAddr("inv-client"),
            makeAddr("inv-contractor"),
            address(usdc),
            500e6,
            keccak256("scope"),
            "https://example.com/scope.json",
            30 days,
            14 days
        );
        handler = new VaultHandler(vault, usdc);

        targetContract(address(handler));
        bytes4[] memory selectors = new bytes4[](10);
        selectors[0] = VaultHandler.advanceTime.selector;
        selectors[1] = VaultHandler.fund.selector;
        selectors[2] = VaultHandler.acknowledge.selector;
        selectors[3] = VaultHandler.submit.selector;
        selectors[4] = VaultHandler.approve.selector;
        selectors[5] = VaultHandler.requestRevision.selector;
        selectors[6] = VaultHandler.dispute.selector;
        selectors[7] = VaultHandler.claim.selector;
        selectors[8] = VaultHandler.refund.selector;
        selectors[9] = VaultHandler.proposeCancel.selector;
        targetSelector(FuzzSelector({addr: address(handler), selectors: selectors}));
    }

    function _isTerminal(MilestoneVault.State s) internal pure returns (bool) {
        return uint256(s) >= uint256(MilestoneVault.State.Settled);
    }

    function invariant_BalanceMatchesState() public {
        MilestoneVault.State s = vault.state();
        uint256 balance = usdc.balanceOf(address(vault));

        if (s == MilestoneVault.State.Created) {
            assertEq(balance, 0, "created vault must hold nothing");
        } else if (_isTerminal(s)) {
            assertEq(balance, 0, "terminal vault must be empty");
            ghost_terminalObserved = true;
        } else {
            assertEq(balance, vault.amount(), "live funded vault must hold exactly the commitment");
        }
    }

    function invariant_TerminalIsFinal() public view {
        if (ghost_terminalObserved) {
            assertTrue(_isTerminal(vault.state()), "terminal state regressed to non-terminal");
        }
    }

    function invariant_VaultNeverHoldsMoreThanCommitment() public view {
        assertTrue(usdc.balanceOf(address(vault)) <= vault.amount(), "vault overfunded");
    }
}
