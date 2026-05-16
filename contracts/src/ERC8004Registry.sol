// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

contract ERC8004Registry {
    struct AgentReputation {
        uint256 totalRating;
        uint256 feedbackCount;
    }

    mapping(uint256 => AgentReputation) public agentReputation;

    event FeedbackRecorded(uint256 indexed agentId, uint8 rating, string metadataURI);

    function recordFeedback(uint256 agentId, uint8 rating, string calldata metadataURI) external {
        require(rating >= 1 && rating <= 5, "INVALID_RATING");
        agentReputation[agentId].totalRating += rating;
        agentReputation[agentId].feedbackCount += 1;
        emit FeedbackRecorded(agentId, rating, metadataURI);
    }

    function getAverageRating(uint256 agentId) external view returns (uint256) {
        if (agentReputation[agentId].feedbackCount == 0) return 0;
        return agentReputation[agentId].totalRating / agentReputation[agentId].feedbackCount;
    }

    function verifyAgent(uint256 agentId) external view returns (bool) {
        return agentReputation[agentId].feedbackCount > 0;
    }
}
