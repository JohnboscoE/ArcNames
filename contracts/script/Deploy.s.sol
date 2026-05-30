// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/ArcNames.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address platform    = vm.envAddress("PLATFORM_ADDRESS");
        address usdc        = vm.envAddress("USDC_ADDRESS");

        vm.startBroadcast(deployerKey);

        ArcNames arcNames = new ArcNames(usdc, platform);
        console.log("ArcNames deployed at:", address(arcNames));

        vm.stopBroadcast();
    }
}
