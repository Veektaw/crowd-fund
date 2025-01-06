// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

import "contracts/PriceConverter.sol";

error FundMe__NotOwner();

/**
 * @title FundMe
 * @author Victor Ose Iyayi
 * @notice This contract allows users to contribute ETH to a crowdfunding campaign,
 *         with a minimum contribution amount in USD. It uses a Chainlink Price Feed
 *         on the Sepolia Testnet for ETH/USD conversion.
 * @dev This contract demonstrates basic crowdfunding functionality and includes
 *      security measures such as an owner-only withdrawal function. It uses
 *      the Chainlink ETH/USD price feed to ensure contributions meet a minimum
 *      USD value.
 */
contract FundMe {
    using PriceConverter for uint256;

    /**
     * @notice The minimum contribution amount in USD (60 USD).
     */
    uint256 public constant MINIMUM_USD = 60 * 1e18;

    /**
     * @notice An array of addresses that have contributed to the contract.
     */
    address[] private s_funders;

    /**
     * @notice A mapping of addresses to the amount of ETH they have contributed.
     */
    mapping(address => uint256) private s_addressToAmountFunded;

    /**
     * @notice The owner of the contract.
     */
    address private immutable i_owner;

    /**
     * @notice The Chainlink price feed contract.
     */
    AggregatorV3Interface public s_priceFeed;

    /**
     * @notice Constructor for the FundMe contract.
     * @param priceFeedAddress The address of the Chainlink ETH/USD price feed.
     * @dev Sets the contract owner and initializes the price feed.
     */
    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    /**
     * @notice Allows the contract to receive ETH. Calls the `fund()` function.
     */
    receive() external payable {
        fund();
    }

    /**
     * @notice Allows the contract to receive ETH. Calls the `fund()` function.
     */
    fallback() external payable {
        fund();
    }

    /**
     * @notice Allows users to contribute ETH to the contract.
     * @dev Requires that the contribution, converted to USD, is greater than or
     *      equal to the minimum USD amount. Adds the funder's address to the
     *      `funders` array and updates their contribution amount in the
     *      `addressToAmountFunded` mapping.
     */
    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "Not enough ETH"
        );

        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] += msg.value;
    }

    /**
     * @notice Allows the contract owner to withdraw all funds.
     * @dev Only the contract owner can call this function. It resets the
     *      `s_funders` array and the `addressToAmountFunded` mapping. It uses
     *      `call` to transfer the funds to the owner.
     */
    function withdraw() public payable onlyOwner {
        for (
            uint256 s_fundersIndex = 0;
            s_fundersIndex < s_funders.length;
            ++s_fundersIndex
        ) {
            address funder = s_funders[s_fundersIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }

    /**
     * @notice Modifier that restricts function access to the contract owner.
     * @dev Reverts with the `FundMe__NotOwner` error if the caller is not the owner.
     */
    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAmountAddresss(address funder) public view returns (uint256) {
        return s_addressToAmountFunded[funder];
    }

    function getPricefeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
