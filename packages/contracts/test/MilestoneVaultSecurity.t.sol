// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MilestoneVault} from "../src/MilestoneVault.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";

contract MilestoneVaultSecurityTest is Test {
    MilestoneVault internal vault;
    MockUSDC internal usdc;

    address internal client = makeAddr("client");
    address internal contractor = makeAddr("contractor");
    address internal other = makeAddr("other");

    uint256 internal amount = 1_000e6;

    function setUp() public {
        usdc = new MockUSDC();
        vm.prank(client);
        vault = new MilestoneVault(
            client,
            contractor,
            address(usdc),
            amount,
            keccak256("scope"),
            "https://example.com/scope.json",
            7 days,
            3 days
        );
        usdc.mint(client, 10_000_000e6);
    }

    function _fund() internal {
        vm.startPrank(client);
        usdc.approve(address(vault), amount);
        vault.fundMilestone();
        vm.stopPrank();
    }

    function _submit() internal {
        vm.prank(contractor);
        vault.submitWork(keccak256("ev"), "https://example.com/ev.json");
    }

    function test_FundRevertsWhenTokenTransferFails() public {
        usdc.setFailTransfers(true);
        vm.startPrank(client);
        usdc.approve(address(vault), amount);
        vm.expectRevert(MilestoneVault.TokenTransferFailed.selector);
        vault.fundMilestone();
        vm.stopPrank();

        assertTrue(vault.state() == MilestoneVault.State.Created);
        assertEq(usdc.balanceOf(address(vault)), 0);
    }

    function test_ApproveRevertsWhenTokenTransferFails() public {
        _fund();
        _submit();
        usdc.setFailTransfers(true);
        vm.prank(client);
        vm.expectRevert(MilestoneVault.TokenTransferFailed.selector);
        vault.approveAndRelease();
        assertFalse(usdc.balanceOf(contractor) == amount);
    }

    function test_ClaimRevertsWhenTokenTransferFails() public {
        _fund();
        _submit();
        vm.warp(block.timestamp + 3 days + 1);
        usdc.setFailTransfers(true);
        vm.prank(other);
        vm.expectRevert(MilestoneVault.TokenTransferFailed.selector);
        vault.claimAfterReview();

        usdc.setFailTransfers(false);
        vm.prank(other);
        vault.claimAfterReview();
        assertEq(usdc.balanceOf(contractor), amount);
    }

    function test_RefundRevertsWhenTokenTransferFails() public {
        _fund();
        vm.warp(block.timestamp + 7 days + 1);
        usdc.setFailTransfers(true);
        vm.prank(client);
        vm.expectRevert(MilestoneVault.TokenTransferFailed.selector);
        vault.refundExpired();

        usdc.setFailTransfers(false);
        vm.prank(client);
        vault.refundExpired();
        assertEq(usdc.balanceOf(client), 10_000_000e6);
    }

    function test_MutualCancelRevertsWhenTokenTransferFails() public {
        _fund();
        usdc.setFailTransfers(true);
        vm.startPrank(client);
        vault.proposeMutualCancel();
        vm.stopPrank();

        vm.prank(contractor);
        vm.expectRevert(MilestoneVault.TokenTransferFailed.selector);
        vault.proposeMutualCancel();

        assertTrue(vault.state() == MilestoneVault.State.Funded);
        assertTrue(vault.clientCancelProposed());
        assertFalse(vault.contractorCancelProposed());

        usdc.setFailTransfers(false);
        vm.prank(contractor);
        vault.proposeMutualCancel();
        assertTrue(vault.state() == MilestoneVault.State.CancelledMutual);
    }

    function test_GetConfigReturnsParameters() public {
        (
            address clientAddr,
            address contractorAddr,
            address tokenAddr,
            uint256 amountVal,
            bytes32 scopeHashVal,
            string memory metadataURIVal,
            uint64 submissionPeriodVal,
            uint64 reviewPeriodVal
        ) = vault.getConfig();

        assertEq(clientAddr, client);
        assertEq(contractorAddr, contractor);
        assertEq(tokenAddr, address(usdc));
        assertEq(amountVal, amount);
        assertEq(scopeHashVal, keccak256("scope"));
        assertEq(metadataURIVal, "https://example.com/scope.json");
        assertEq(submissionPeriodVal, 7 days);
        assertEq(reviewPeriodVal, 3 days);
    }

    function test_GetStatusReturnsInitialState() public {
        (
            MilestoneVault.State stateVal,
            uint64 fundedAtVal,
            uint64 submitDeadlineVal,
            uint64 submittedAtVal,
            uint64 reviewDeadlineVal,
            bytes32 evidenceHashVal,
            string memory evidenceURIVal,
            uint32 revisionCountVal,
            bool clientCancelVal,
            bool contractorCancelVal
        ) = vault.getStatus();

        assertTrue(stateVal == MilestoneVault.State.Created);
        assertEq(fundedAtVal, 0);
        assertEq(submitDeadlineVal, 0);
        assertEq(submittedAtVal, 0);
        assertEq(reviewDeadlineVal, 0);
        assertEq(evidenceHashVal, bytes32(0));
        assertEq(evidenceURIVal, "");
        assertEq(revisionCountVal, 0);
        assertFalse(clientCancelVal);
        assertFalse(contractorCancelVal);
    }
}
