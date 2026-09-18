// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "./IERC20.sol";

contract MilestoneVault {
    enum State {
        Created,
        Funded,
        Active,
        Submitted,
        RevisionRequested,
        Disputed,
        Settled,
        SettledByTimeout,
        RefundedExpired,
        CancelledMutual
    }

    enum RefundReason {
        Expired,
        MutualCancel
    }

    uint64 public constant MIN_PERIOD = 1 days;
    uint64 public constant MAX_SUBMISSION_PERIOD = 365 days;
    uint64 public constant MAX_REVIEW_PERIOD = 30 days;

    address public immutable client;
    address public immutable contractor;
    address public immutable token;
    uint256 public immutable amount;
    bytes32 public immutable scopeHash;
    string public metadataURI;
    uint64 public immutable submissionPeriod;
    uint64 public immutable reviewPeriod;

    State public state;
    uint64 public fundedAt;
    uint64 public submitDeadline;
    uint64 public submittedAt;
    uint64 public reviewDeadline;
    bytes32 public evidenceHash;
    string public evidenceURI;
    uint32 public revisionCount;
    bool public clientCancelProposed;
    bool public contractorCancelProposed;

    bool private locked;

    error ReentrantCall();
    error Unauthorized();
    error InvalidAmount();
    error InvalidParty();
    error InvalidScope();
    error InvalidPeriod();
    error InvalidState(State current);
    error EmptyEvidence();
    error ReviewWindowActive();
    error ReviewWindowExpired();
    error SubmitDeadlineActive();
    error TokenTransferFailed();

    event MilestoneFunded(uint64 fundedAt, uint64 submitDeadline);
    event WorkAcknowledged();
    event WorkSubmitted(bytes32 indexed evidenceHash, string evidenceURI, uint64 submittedAt, uint64 reviewDeadline);
    event RevisionRequested(bytes32 indexed reasonHash, uint32 revisionCount, uint64 submitDeadline);
    event MilestoneDisputed();
    event MilestoneApproved();
    event FundsReleased(address indexed to, uint256 indexed value);
    event TimeoutReleased(uint64 reviewDeadline);
    event MilestoneRefunded(RefundReason reason);
    event MutualCancelProposed(address indexed proposer);

    modifier onlyClient() {
        if (msg.sender != client) revert Unauthorized();
        _;
    }

    modifier onlyContractor() {
        if (msg.sender != contractor) revert Unauthorized();
        _;
    }

    modifier guard() {
        if (locked) revert ReentrantCall();
        locked = true;
        _;
        locked = false;
    }

    constructor(
        address client_,
        address contractor_,
        address token_,
        uint256 amount_,
        bytes32 scopeHash_,
        string memory metadataURI_,
        uint64 submissionPeriod_,
        uint64 reviewPeriod_
    ) {
        if (client_ == address(0) || contractor_ == address(0) || token_ == address(0)) revert InvalidParty();
        if (contractor_ == client_) revert InvalidParty();
        if (amount_ == 0) revert InvalidAmount();
        if (scopeHash_ == bytes32(0) || bytes(metadataURI_).length == 0) revert InvalidScope();
        if (submissionPeriod_ < MIN_PERIOD || submissionPeriod_ > MAX_SUBMISSION_PERIOD) revert InvalidPeriod();
        if (reviewPeriod_ < MIN_PERIOD || reviewPeriod_ > MAX_REVIEW_PERIOD) revert InvalidPeriod();

        client = client_;
        contractor = contractor_;
        token = token_;
        amount = amount_;
        scopeHash = scopeHash_;
        metadataURI = metadataURI_;
        submissionPeriod = submissionPeriod_;
        reviewPeriod = reviewPeriod_;
        state = State.Created;
    }

    function fundMilestone() external onlyClient guard {
        if (state != State.Created) revert InvalidState(state);

        state = State.Funded;
        fundedAt = uint64(block.timestamp);
        submitDeadline = fundedAt + submissionPeriod;

        bool ok = IERC20(token).transferFrom(msg.sender, address(this), amount);
        if (!ok) revert TokenTransferFailed();

        emit MilestoneFunded(fundedAt, submitDeadline);
    }

    function acknowledgeStart() external onlyContractor {
        if (state != State.Funded) revert InvalidState(state);

        state = State.Active;
        emit WorkAcknowledged();
    }

    function submitWork(bytes32 evidenceHash_, string calldata evidenceURI_) external onlyContractor {
        if (
            state != State.Funded && state != State.Active && state != State.RevisionRequested
        ) revert InvalidState(state);
        if (evidenceHash_ == bytes32(0) || bytes(evidenceURI_).length == 0) revert EmptyEvidence();

        submittedAt = uint64(block.timestamp);
        reviewDeadline = submittedAt + reviewPeriod;
        evidenceHash = evidenceHash_;
        evidenceURI = evidenceURI_;
        state = State.Submitted;

        emit WorkSubmitted(evidenceHash_, evidenceURI_, submittedAt, reviewDeadline);
    }

    function approveAndRelease() external onlyClient guard {
        if (state != State.Submitted && state != State.Disputed) revert InvalidState(state);

        state = State.Settled;
        emit MilestoneApproved();

        bool ok = IERC20(token).transfer(contractor, amount);
        if (!ok) revert TokenTransferFailed();

        emit FundsReleased(contractor, amount);
    }

    function requestRevision(bytes32 reasonHash) external onlyClient {
        if (state != State.Submitted) revert InvalidState(state);
        if (block.timestamp >= reviewDeadline) revert ReviewWindowExpired();

        state = State.RevisionRequested;
        unchecked {
            revisionCount += 1;
        }
        submitDeadline = uint64(block.timestamp) + submissionPeriod;
        reviewDeadline = 0;

        emit RevisionRequested(reasonHash, revisionCount, submitDeadline);
    }

    function dispute() external onlyClient {
        if (state != State.Submitted) revert InvalidState(state);
        if (block.timestamp >= reviewDeadline) revert ReviewWindowExpired();

        state = State.Disputed;
        emit MilestoneDisputed();
    }

    function claimAfterReview() external guard {
        if (state != State.Submitted) revert InvalidState(state);
        if (block.timestamp < reviewDeadline) revert ReviewWindowActive();

        state = State.SettledByTimeout;

        bool ok = IERC20(token).transfer(contractor, amount);
        if (!ok) revert TokenTransferFailed();

        emit TimeoutReleased(reviewDeadline);
        emit FundsReleased(contractor, amount);
    }

    function refundExpired() external onlyClient guard {
        if (
            state != State.Funded && state != State.Active && state != State.RevisionRequested
        ) revert InvalidState(state);
        if (block.timestamp <= submitDeadline) revert SubmitDeadlineActive();

        state = State.RefundedExpired;

        bool ok = IERC20(token).transfer(client, amount);
        if (!ok) revert TokenTransferFailed();

        emit MilestoneRefunded(RefundReason.Expired);
    }

    function proposeMutualCancel() external guard {
        if (
            state != State.Funded && state != State.Active && state != State.RevisionRequested
                && state != State.Disputed
        ) revert InvalidState(state);

        if (msg.sender == client) {
            clientCancelProposed = true;
        } else if (msg.sender == contractor) {
            contractorCancelProposed = true;
        } else {
            revert Unauthorized();
        }

        emit MutualCancelProposed(msg.sender);

        if (clientCancelProposed && contractorCancelProposed) {
            state = State.CancelledMutual;

            bool ok = IERC20(token).transfer(client, amount);
            if (!ok) revert TokenTransferFailed();

            emit MilestoneRefunded(RefundReason.MutualCancel);
        }
    }

    function getConfig()
        external
        view
        returns (
            address clientAddr,
            address contractorAddr,
            address tokenAddr,
            uint256 amountVal,
            bytes32 scopeHashVal,
            string memory metadataURIVal,
            uint64 submissionPeriodVal,
            uint64 reviewPeriodVal
        )
    {
        return (client, contractor, token, amount, scopeHash, metadataURI, submissionPeriod, reviewPeriod);
    }

    function getStatus()
        external
        view
        returns (
            State stateVal,
            uint64 fundedAtVal,
            uint64 submitDeadlineVal,
            uint64 submittedAtVal,
            uint64 reviewDeadlineVal,
            bytes32 evidenceHashVal,
            string memory evidenceURIVal,
            uint32 revisionCountVal,
            bool clientCancelProposedVal,
            bool contractorCancelProposedVal
        )
    {
        return (
            state,
            fundedAt,
            submitDeadline,
            submittedAt,
            reviewDeadline,
            evidenceHash,
            evidenceURI,
            revisionCount,
            clientCancelProposed,
            contractorCancelProposed
        );
    }
}
