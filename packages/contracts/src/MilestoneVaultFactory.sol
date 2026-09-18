// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {MilestoneVault} from "./MilestoneVault.sol";

contract MilestoneVaultFactory {
    address[] private vaults;
    mapping(address => bool) public isVault;

    event MilestoneCreated(
        address indexed vault,
        address indexed client,
        address indexed contractor,
        address token,
        uint256 amount,
        bytes32 scopeHash,
        string metadataURI,
        uint64 submissionPeriod,
        uint64 reviewPeriod
    );

    function createMilestone(
        address contractor,
        address token,
        uint256 amount,
        bytes32 scopeHash,
        string calldata metadataURI,
        uint64 submissionPeriod,
        uint64 reviewPeriod
    ) external returns (address vault) {
        vault = address(
            new MilestoneVault(
                msg.sender,
                contractor,
                token,
                amount,
                scopeHash,
                metadataURI,
                submissionPeriod,
                reviewPeriod
            )
        );

        vaults.push(vault);
        isVault[vault] = true;

        emit MilestoneCreated(
            vault,
            msg.sender,
            contractor,
            token,
            amount,
            scopeHash,
            metadataURI,
            submissionPeriod,
            reviewPeriod
        );
    }

    function vaultCount() external view returns (uint256) {
        return vaults.length;
    }

    function allVaults() external view returns (address[] memory) {
        return vaults;
    }
}
