// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {MilestoneVaultFactory} from "../src/MilestoneVaultFactory.sol";
import {MockUSDC} from "../test/mocks/MockUSDC.sol";

contract DeployLocal is Script {
    address constant ANVIL_ACCOUNT_0 = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
    address constant ANVIL_ACCOUNT_1 = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
    uint256 constant ANVIL_PRIVATE_KEY_0 =
        0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;

    function run() external returns (address usdc, address factoryAddress) {
        require(block.chainid == 31337, "DeployLocal: only for chain 31337 (anvil)");

        uint256 pk = vm.envOr("PRIVATE_KEY", ANVIL_PRIVATE_KEY_0);

        vm.startBroadcast(pk);
        MockUSDC token = new MockUSDC();
        token.mint(ANVIL_ACCOUNT_0, 1_000_000e6);
        token.mint(ANVIL_ACCOUNT_1, 1_000_000e6);
        MilestoneVaultFactory factory = new MilestoneVaultFactory();
        vm.stopBroadcast();

        usdc = address(token);
        factoryAddress = address(factory);

        string memory json = "deployment";
        vm.serializeAddress(json, "factory", factoryAddress);
        vm.serializeUint(json, "chainId", block.chainid);
        vm.serializeAddress(json, "usdc", usdc);
        string memory output = vm.serializeUint(json, "deployedAt", block.timestamp);
        vm.createDir("deployments", true);
        vm.writeJson(output, "deployments/31337.json");

        console2.log("MockUSDC:", usdc);
        console2.log("MilestoneVaultFactory:", factoryAddress);
        console2.log("Funded anvil accounts 0 and 1 with 1,000,000 USDC each.");
    }
}
