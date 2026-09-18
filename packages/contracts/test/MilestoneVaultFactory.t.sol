// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MilestoneVault} from "../src/MilestoneVault.sol";
import {MilestoneVaultFactory} from "../src/MilestoneVaultFactory.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";

contract MilestoneVaultFactoryTest is Test {
    MilestoneVaultFactory internal factory;
    MockUSDC internal usdc;

    address internal client = makeAddr("client");
    address internal contractor = makeAddr("contractor");

    uint256 internal amount = 750e6;
    bytes32 internal scopeHash = keccak256("scope");
    string internal metadataURI = "https://example.com/scope.json";

    function setUp() public {
        factory = new MilestoneVaultFactory();
        usdc = new MockUSDC();
    }

    function test_CreatesVaultWithCallerAsClient() public {
        address predictedVault = vm.computeCreateAddress(address(factory), vm.getNonce(address(factory)));

        vm.expectEmit(true, true, true, true, address(factory));
        emit MilestoneVaultFactory.MilestoneCreated(
            predictedVault, client, contractor, address(usdc), amount, scopeHash, metadataURI, 7 days, 3 days
        );
        vm.prank(client);
        address vaultAddr = factory.createMilestone(
            contractor, address(usdc), amount, scopeHash, metadataURI, 7 days, 3 days
        );

        assertEq(vaultAddr, predictedVault);
        assertTrue(vaultAddr != address(0));
        assertTrue(factory.isVault(vaultAddr));
        assertEq(factory.vaultCount(), 1);
        assertEq(factory.allVaults()[0], vaultAddr);

        MilestoneVault vault = MilestoneVault(vaultAddr);
        assertEq(vault.client(), client);
        assertEq(vault.contractor(), contractor);
        assertEq(vault.token(), address(usdc));
        assertEq(vault.amount(), amount);
        assertTrue(vault.state() == MilestoneVault.State.Created);
    }

    function test_FactoryHasNoPrivilegesOverVaults() public {
        vm.prank(client);
        address vaultAddr = factory.createMilestone(
            contractor, address(usdc), amount, scopeHash, metadataURI, 7 days, 3 days
        );

        usdc.mint(client, amount);
        vm.startPrank(client);
        usdc.approve(vaultAddr, amount);
        MilestoneVault(vaultAddr).fundMilestone();
        vm.stopPrank();

        vm.prank(contractor);
        MilestoneVault(vaultAddr).submitWork(keccak256("ev"), "https://example.com/ev.json");

        vm.prank(client);
        MilestoneVault(vaultAddr).approveAndRelease();

        assertEq(usdc.balanceOf(contractor), amount);
        assertEq(usdc.balanceOf(address(factory)), 0);
        assertEq(usdc.balanceOf(vaultAddr), 0);
    }

    function test_CreatesManyIndependentVaults() public {
        address a;
        address b;
        vm.startPrank(client);
        a = factory.createMilestone(
            contractor, address(usdc), amount, scopeHash, metadataURI, 7 days, 3 days
        );
        b = factory.createMilestone(
            makeAddr("contractor2"), address(usdc), 2 * amount, keccak256("scope2"), metadataURI, 14 days, 7 days
        );
        vm.stopPrank();

        assertTrue(a != b);
        assertEq(factory.vaultCount(), 2);
        assertEq(MilestoneVault(a).amount(), amount);
        assertEq(MilestoneVault(b).amount(), 2 * amount);
    }

    function test_CreateRevertsOnInvalidParameters() public {
        vm.prank(client);
        vm.expectRevert(MilestoneVault.InvalidParty.selector);
        factory.createMilestone(
            address(0), address(usdc), amount, scopeHash, metadataURI, 7 days, 3 days
        );

        vm.prank(client);
        vm.expectRevert(MilestoneVault.InvalidPeriod.selector);
        factory.createMilestone(
            contractor, address(usdc), amount, scopeHash, metadataURI, 7 days, 31 days
        );
    }
}
