// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "./ERC20Base.sol";

contract NoCoin is ERC20Base {

    string public _name = "NoCoin";
    string public _symbol = "NOC";
    uint8 public _decimals = 18;
    uint256 public _total = 1000000 * 10**18;

    struct Transactions {
        uint256 Amount;
        uint256 Volume;
    }

    Transactions private Stat = Transactions(0, 0);

    constructor() ERC20Base(_name, _symbol, _decimals, _total) {
        _mint(msg.sender, _total);
        //_balances[msg.sender] = _total;
    }

    function transferFrom(
        address payable from,
        address payable to,
        uint256 value
    ) public override {
        super.transferFrom(from, to, value);
        // custom operations added to the basic send
        Stat.Amount++;
        Stat.Volume += value;
    }

    function getStat() public view returns (Transactions memory) {
        return Stat;
    }
}