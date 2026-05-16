// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

interface IERC8004Registry {
    function verifyAgent(uint256 agentId) external view returns (bool);
    function recordFeedback(uint256 agentId, uint8 confidenceRating, string calldata metadataURI) external;
}
