// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/ArcNames.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {}
    function mint(address to, uint256 amount) external { _mint(to, amount); }
    function decimals() public pure override returns (uint8) { return 6; }
}

contract ArcNamesTest is Test {
    ArcNames arcNames;
    TestUSDC usdc;

    address platform = address(0x1111111111111111111111111111111111111111);
    address alice    = address(0x2222222222222222222222222222222222222222);
    address bob      = address(0x3333333333333333333333333333333333333333);

    function setUp() public {
        usdc     = new TestUSDC();
        arcNames = new ArcNames(address(usdc), platform);
        usdc.mint(alice, 1000e6);
        usdc.mint(bob,   1000e6);
    }

    function test_RegisterName() public {
        vm.startPrank(alice);
        usdc.approve(address(arcNames), 100e6);
        arcNames.register("alice", 1);
        vm.stopPrank();
        assertEq(arcNames.nameToOwner("alice"), alice);
        assertFalse(arcNames.isAvailable("alice"));
    }

    function test_ResolveName() public {
        vm.startPrank(alice);
        usdc.approve(address(arcNames), 100e6);
        arcNames.register("alice", 1);
        vm.stopPrank();
        assertEq(arcNames.resolve("alice"), alice);
    }

    function test_ReverseLookup() public {
        vm.startPrank(alice);
        usdc.approve(address(arcNames), 100e6);
        arcNames.register("alice", 1);
        vm.stopPrank();
        assertEq(arcNames.reverseLookup(alice), "alice");
    }

    function test_CannotRegisterTakenName() public {
        vm.startPrank(alice);
        usdc.approve(address(arcNames), 100e6);
        arcNames.register("alice", 1);
        vm.stopPrank();
        vm.startPrank(bob);
        usdc.approve(address(arcNames), 100e6);
        vm.expectRevert("Name already taken");
        arcNames.register("alice", 1);
        vm.stopPrank();
    }

    function test_RenewName() public {
        vm.startPrank(alice);
        usdc.approve(address(arcNames), 200e6);
        arcNames.register("alice", 1);
        uint256 before = arcNames.nameExpiry("alice");
        arcNames.renew("alice", 1);
        vm.stopPrank();
        assertGt(arcNames.nameExpiry("alice"), before);
    }

    function test_InvalidNameTooShort() public {
        vm.startPrank(alice);
        usdc.approve(address(arcNames), 100e6);
        vm.expectRevert("Name too short (min 3 chars)");
        arcNames.register("ab", 1);
        vm.stopPrank();
    }

    function test_InvalidNameUppercase() public {
        vm.startPrank(alice);
        usdc.approve(address(arcNames), 100e6);
        vm.expectRevert("Invalid character - only a-z, 0-9, hyphen allowed");
        arcNames.register("Alice", 1);
        vm.stopPrank();
    }
}
