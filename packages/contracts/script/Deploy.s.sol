// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {MilestoneVaultFactory} from "../src/MilestoneVaultFactory.sol";

contract Deploy is Script {
    address constant ARC_MAINNET_USDC = 0x3600000000000000000000000000000000000000;
    uint256 constant ARC_MAINNET_CHAIN_ID = 5042;

    function run() external returns (address factoryAddress) {
        uint256 chainId = block.chainid;
        address usdc = vm.envOr("USDC_ADDRESS", ARC_MAINNET_USDC);
        if (chainId != ARC_MAINNET_CHAIN_ID && usdc == ARC_MAINNET_USDC) {
            console2.log(
                "WARNING: not Arc mainnet and USDC_ADDRESS not set; defaulting to mainnet USDC."
            );
            console2.log("Set USDC_ADDRESS for testnet rehearsal.");
        }
        string memory commitHash = vm.envOr("GIT_COMMIT", string("dev"));

        vm.startBroadcast();
        MilestoneVaultFactory factory = new MilestoneVaultFactory();
        vm.stopBroadcast();

        factoryAddress = address(factory);

        string memory json = "deployment";
        vm.serializeAddress(json, "factory", factoryAddress);
        vm.serializeUint(json, "chainId", chainId);
        vm.serializeAddress(json, "usdc", usdc);
        vm.serializeString(json, "commit", commitHash);
        string memory output = vm.serializeUint(json, "deployedAt", block.timestamp);

        vm.createDir("deployments", true);
        vm.writeJson(output, string.concat("deployments/", vm.toString(chainId), ".json"));

        console2.log("MilestoneVaultFactory deployed:", factoryAddress);
        console2.log("USDC:", usdc);
        console2.log("Chain ID:", chainId);
    }
}
