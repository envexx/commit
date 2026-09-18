// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MilestoneVault} from "../src/MilestoneVault.sol";
import {MilestoneVaultFactory} from "../src/MilestoneVaultFactory.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";

contract MilestoneVaultBase is Test {
    MilestoneVault internal vault;
    MockUSDC internal usdc;

    address internal client = makeAddr("client");
    address internal contractor = makeAddr("contractor");
    address internal other = makeAddr("other");

    uint64 internal submissionPeriod = 7 days;
    uint64 internal reviewPeriod = 3 days;
    uint256 internal amount = 1_000e6;
    bytes32 internal scopeHash = keccak256("scope: landing page v1");
    string internal metadataURI = "https://example.com/scope.json";
    bytes32 internal evidenceHash = keccak256("evidence: pr #42");
    string internal evidenceURI = "https://example.com/evidence.json";
    bytes32 internal reasonHash = keccak256("reason: fix nav");

    function setUp() public virtual {}

    constructor() {
        usdc = new MockUSDC();
        usdc.mint(client, 10_000_000e6);
    }

    function _createVault() internal returns (MilestoneVault) {
        vm.prank(client);
        return new MilestoneVault(
            client,
            contractor,
            address(usdc),
            amount,
            scopeHash,
            metadataURI,
            submissionPeriod,
            reviewPeriod
        );
    }

    function _setUpVault() internal {
        vault = _createVault();
        _fund();
    }

    function _fund() internal {
        vm.startPrank(client);
        usdc.approve(address(vault), amount);
        vault.fundMilestone();
        vm.stopPrank();
    }

    function _acknowledge() internal {
        vm.prank(contractor);
        vault.acknowledgeStart();
    }

    function _submit() internal {
        vm.prank(contractor);
        vault.submitWork(evidenceHash, evidenceURI);
    }

    function _approve() internal {
        vm.prank(client);
        vault.approveAndRelease();
    }

    function _dispute() internal {
        vm.prank(client);
        vault.dispute();
    }

    function _revise() internal {
        vm.prank(client);
        vault.requestRevision(reasonHash);
    }
}

contract CreationTests is MilestoneVaultBase {
    function test_SetsAllParameters() public {
        vault = _createVault();

        assertEq(vault.client(), client);
        assertEq(vault.contractor(), contractor);
        assertEq(vault.token(), address(usdc));
        assertEq(vault.amount(), amount);
        assertEq(vault.scopeHash(), scopeHash);
        assertEq(vault.metadataURI(), metadataURI);
        assertEq(vault.submissionPeriod(), submissionPeriod);
        assertEq(vault.reviewPeriod(), reviewPeriod);
        assertTrue(vault.state() == MilestoneVault.State.Created);
        assertEq(usdc.balanceOf(address(vault)), 0);
    }

    function test_RevertWhen_AmountZero() public {
        vm.prank(client);
        vm.expectRevert(MilestoneVault.InvalidAmount.selector);
        new MilestoneVault(
            client, contractor, address(usdc), 0, scopeHash, metadataURI, submissionPeriod, reviewPeriod
        );
    }

    function test_RevertWhen_SameClientAndContractor() public {
        vm.prank(client);
        vm.expectRevert(MilestoneVault.InvalidParty.selector);
        new MilestoneVault(
            client, client, address(usdc), amount, scopeHash, metadataURI, submissionPeriod, reviewPeriod
        );
    }

    function test_RevertWhen_ZeroAddresses() public {
        vm.prank(client);
        vm.expectRevert(MilestoneVault.InvalidParty.selector);
        new MilestoneVault(
            address(0), contractor, address(usdc), amount, scopeHash, metadataURI, submissionPeriod, reviewPeriod
        );

        vm.prank(client);
        vm.expectRevert(MilestoneVault.InvalidParty.selector);
        new MilestoneVault(
            client, address(0), address(usdc), amount, scopeHash, metadataURI, submissionPeriod, reviewPeriod
        );

        vm.prank(client);
        vm.expectRevert(MilestoneVault.InvalidParty.selector);
        new MilestoneVault(
            client, contractor, address(0), amount, scopeHash, metadataURI, submissionPeriod, reviewPeriod
        );
    }

    function test_RevertWhen_EmptyScope() public {
        vm.prank(client);
        vm.expectRevert(MilestoneVault.InvalidScope.selector);
        new MilestoneVault(
            client,
            contractor,
            address(usdc),
            amount,
            bytes32(0),
            metadataURI,
            submissionPeriod,
            reviewPeriod
        );

        vm.prank(client);
        vm.expectRevert(MilestoneVault.InvalidScope.selector);
        new MilestoneVault(
            client, contractor, address(usdc), amount, scopeHash, "", submissionPeriod, reviewPeriod
        );
    }

    function test_RevertWhen_PeriodOutOfBounds() public {
        vm.prank(client);
        vm.expectRevert(MilestoneVault.InvalidPeriod.selector);
        new MilestoneVault(client, contractor, address(usdc), amount, scopeHash, metadataURI, 0, reviewPeriod);

        vm.prank(client);
        vm.expectRevert(MilestoneVault.InvalidPeriod.selector);
        new MilestoneVault(
            client, contractor, address(usdc), amount, scopeHash, metadataURI, 366 days, reviewPeriod
        );

        vm.prank(client);
        vm.expectRevert(MilestoneVault.InvalidPeriod.selector);
        new MilestoneVault(client, contractor, address(usdc), amount, scopeHash, metadataURI, submissionPeriod, 0);

        vm.prank(client);
        vm.expectRevert(MilestoneVault.InvalidPeriod.selector);
        new MilestoneVault(
            client, contractor, address(usdc), amount, scopeHash, metadataURI, submissionPeriod, 31 days
        );
    }
}

contract FundingTests is MilestoneVaultBase {
    function setUp() public override {
        super.setUp();
        vault = _createVault();
    }

    function test_FundsExactAmountAndSetsFunded() public {
        vm.startPrank(client);
        usdc.approve(address(vault), amount);
        vault.fundMilestone();
        vm.stopPrank();

        assertTrue(vault.state() == MilestoneVault.State.Funded);
        assertEq(vault.fundedAt(), block.timestamp);
        assertEq(vault.submitDeadline(), block.timestamp + submissionPeriod);
        assertEq(usdc.balanceOf(address(vault)), amount);
        assertEq(usdc.balanceOf(client), 10_000_000e6 - amount);
    }    function test_OnlyClientCanFund() public {
        usdc.mint(other, amount);
        vm.startPrank(other);
        usdc.approve(address(vault), amount);
        vm.expectRevert(MilestoneVault.Unauthorized.selector);
        vault.fundMilestone();
        vm.stopPrank();

        vm.startPrank(contractor);
        usdc.approve(address(vault), amount);
        vm.expectRevert(MilestoneVault.Unauthorized.selector);
        vault.fundMilestone();
        vm.stopPrank();
    }

    function test_CannotDoubleFund() public {
        _fund();
        vm.startPrank(client);
        usdc.approve(address(vault), amount);
        vm.expectRevert(
            abi.encodeWithSelector(MilestoneVault.InvalidState.selector, MilestoneVault.State.Funded)
        );
        vault.fundMilestone();
        vm.stopPrank();
    }

    function test_RevertWithoutAllowance() public {
        vm.prank(client);
        vm.expectRevert("insufficient allowance");
        vault.fundMilestone();
    }
}

contract AcknowledgeTests is MilestoneVaultBase {
    function setUp() public override {
        super.setUp();
        _setUpVault();
    }

    function test_ActivatesMilestone() public {
        vm.prank(contractor);
        vm.expectEmit(true, true, true, true, address(vault));
        emit MilestoneVault.WorkAcknowledged();
        vault.acknowledgeStart();

        assertTrue(vault.state() == MilestoneVault.State.Active);
    }
    function test_OnlyContractor() public {
        vm.prank(client);
        vm.expectRevert(MilestoneVault.Unauthorized.selector);
        vault.acknowledgeStart();

        vm.prank(other);
        vm.expectRevert(MilestoneVault.Unauthorized.selector);
        vault.acknowledgeStart();
    }

    function test_OnlyFromFunded() public {
        _acknowledge();
        vm.prank(contractor);
        vm.expectRevert(
            abi.encodeWithSelector(MilestoneVault.InvalidState.selector, MilestoneVault.State.Active)
        );
        vault.acknowledgeStart();
    }
}

contract SubmissionTests is MilestoneVaultBase {
    function setUp() public override {
        super.setUp();
        _setUpVault();
    }

    function test_SubmitsFromFunded() public {
        vm.prank(contractor);
        vm.expectEmit(true, true, true, true, address(vault));
        emit MilestoneVault.WorkSubmitted(evidenceHash, evidenceURI, uint64(block.timestamp), uint64(block.timestamp) + reviewPeriod);
        vault.submitWork(evidenceHash, evidenceURI);

        assertTrue(vault.state() == MilestoneVault.State.Submitted);
        assertEq(vault.submittedAt(), block.timestamp);
        assertEq(vault.reviewDeadline(), block.timestamp + reviewPeriod);
        assertEq(vault.evidenceHash(), evidenceHash);
        assertEq(vault.evidenceURI(), evidenceURI);
    }

    function test_SubmitsFromActive() public {
        _acknowledge();
        _submit();
        assertTrue(vault.state() == MilestoneVault.State.Submitted);
    }

    function test_OnlyContractor() public {
        vm.prank(client);
        vm.expectRevert(MilestoneVault.Unauthorized.selector);
        vault.submitWork(evidenceHash, evidenceURI);

        vm.prank(other);
        vm.expectRevert(MilestoneVault.Unauthorized.selector);
        vault.submitWork(evidenceHash, evidenceURI);
    }

    function test_RejectsInvalidStates() public {
        MilestoneVault fresh = _createVault();
        vm.prank(contractor);
        vm.expectRevert(
            abi.encodeWithSelector(MilestoneVault.InvalidState.selector, MilestoneVault.State.Created)
        );
        fresh.submitWork(evidenceHash, evidenceURI);

        _submit();
        vm.prank(contractor);
        vm.expectRevert(
            abi.encodeWithSelector(MilestoneVault.InvalidState.selector, MilestoneVault.State.Submitted)
        );
        vault.submitWork(evidenceHash, evidenceURI);
    }

    function test_RevertWhen_EmptyEvidence() public {
        vm.prank(contractor);
        vm.expectRevert(MilestoneVault.EmptyEvidence.selector);
        vault.submitWork(bytes32(0), evidenceURI);

        vm.prank(contractor);
        vm.expectRevert(MilestoneVault.EmptyEvidence.selector);
        vault.submitWork(evidenceHash, "");
    }

    function test_SubmitAfterRevision() public {
        _submit();
        _revise();

        uint64 newDeadline = uint64(block.timestamp) + reviewPeriod;
        vm.prank(contractor);
        vault.submitWork(keccak256("evidence v2"), "https://example.com/evidence-v2.json");

        assertTrue(vault.state() == MilestoneVault.State.Submitted);
        assertEq(vault.reviewDeadline(), newDeadline);
        assertEq(vault.evidenceHash(), keccak256("evidence v2"));
    }
}

contract ApprovalTests is MilestoneVaultBase {
    function setUp() public override {
        super.setUp();
        _setUpVault();
    }

    function test_ReleasesExactAmount() public {
        _submit();
        uint256 before = usdc.balanceOf(contractor);

        vm.prank(client);
        vm.expectEmit(true, true, true, true, address(vault));
        emit MilestoneVault.FundsReleased(contractor, amount);
        vault.approveAndRelease();

        assertTrue(vault.state() == MilestoneVault.State.Settled);
        assertEq(usdc.balanceOf(contractor), before + amount);
        assertEq(usdc.balanceOf(address(vault)), 0);
    }

    function test_OnlyClient() public {
        _submit();
        vm.prank(contractor);
        vm.expectRevert(MilestoneVault.Unauthorized.selector);
        vault.approveAndRelease();

        vm.prank(other);
        vm.expectRevert(MilestoneVault.Unauthorized.selector);
        vault.approveAndRelease();
    }

    function test_OnlyFromSubmittedOrDisputed() public {
        vm.prank(client);
        vm.expectRevert(
            abi.encodeWithSelector(MilestoneVault.InvalidState.selector, MilestoneVault.State.Funded)
        );
        vault.approveAndRelease();
    }

    function test_CannotReleaseTwice() public {
        _submit();
        _approve();
        vm.prank(client);
        vm.expectRevert(
            abi.encodeWithSelector(MilestoneVault.InvalidState.selector, MilestoneVault.State.Settled)
        );
        vault.approveAndRelease();
    }

    function test_ApproveFromDisputed() public {
        _submit();
        _dispute();
        _approve();
        assertTrue(vault.state() == MilestoneVault.State.Settled);
        assertEq(usdc.balanceOf(contractor), amount);
    }

    function test_ApproveAllowedAfterReviewDeadline() public {
        _submit();
        vm.warp(block.timestamp + reviewPeriod + 1 hours);
        _approve();
        assertTrue(vault.state() == MilestoneVault.State.Settled);
    }
}

contract RevisionTests is MilestoneVaultBase {
    function setUp() public override {
        super.setUp();
        _setUpVault();
    }

    function test_ReturnsToRevisionRequested() public {
        _submit();
        uint64 oldSubmitDeadline = vault.submitDeadline();
        vm.warp(block.timestamp + 1 hours);
        uint64 expected = uint64(block.timestamp) + submissionPeriod;

        vm.prank(client);
        vault.requestRevision(reasonHash);

        assertTrue(vault.state() == MilestoneVault.State.RevisionRequested);
        assertEq(vault.revisionCount(), 1);
        assertEq(vault.submitDeadline(), expected);
        assertGt(vault.submitDeadline(), oldSubmitDeadline);
        assertEq(vault.reviewDeadline(), 0);
    }

    function test_OnlyClient() public {
        _submit();
        vm.prank(contractor);
        vm.expectRevert(MilestoneVault.Unauthorized.selector);
        vault.requestRevision(reasonHash);
    }

    function test_OnlyDuringReviewWindow() public {
        _submit();
        vm.warp(block.timestamp + reviewPeriod + 1);
        vm.prank(client);
        vm.expectRevert(MilestoneVault.ReviewWindowExpired.selector);
        vault.requestRevision(reasonHash);
    }

    function test_OnlyFromSubmitted() public {
        vm.prank(client);
        vm.expectRevert(
            abi.encodeWithSelector(MilestoneVault.InvalidState.selector, MilestoneVault.State.Funded)
        );
        vault.requestRevision(reasonHash);
    }

    function test_ResubmissionRestartsReviewClock() public {
        _submit();
        vm.warp(block.timestamp + 1 days);
        _revise();
        uint64 reviseAt = uint64(block.timestamp);

        vm.warp(block.timestamp + 2 days);
        _submit();

        assertEq(vault.reviewDeadline(), reviseAt + 2 days + reviewPeriod);
        assertTrue(vault.state() == MilestoneVault.State.Submitted);
    }

    function test_RefundAvailableAfterResubmitDeadlinePasses() public {
        _submit();
        _revise();
        uint64 resubmitDeadline = vault.submitDeadline();
        assertGt(resubmitDeadline, block.timestamp);

        vm.warp(resubmitDeadline + 1);
        vm.prank(client);
        vault.refundExpired();

        assertTrue(vault.state() == MilestoneVault.State.RefundedExpired);
        assertEq(usdc.balanceOf(client), 10_000_000e6);
        assertEq(usdc.balanceOf(address(vault)), 0);
    }

    function test_MultipleRevisions() public {
        _submit();
        _revise();
        _submit();
        _revise();
        assertEq(vault.revisionCount(), 2);

        _submit();
        assertTrue(vault.state() == MilestoneVault.State.Submitted);
    }
}

contract TimeoutClaimTests is MilestoneVaultBase {
    function setUp() public override {
        super.setUp();
        _setUpVault();
    }

    function test_RevertsBeforeReviewDeadline() public {
        _submit();
        vm.warp(block.timestamp + reviewPeriod - 1);
        vm.prank(contractor);
        vm.expectRevert(MilestoneVault.ReviewWindowActive.selector);
        vault.claimAfterReview();
    }

    function test_RevertsExactlyAtBoundaryMinusOneSecond() public {
        _submit();
        vm.warp(block.timestamp + reviewPeriod - 1 seconds);
        vm.prank(other);
        vm.expectRevert(MilestoneVault.ReviewWindowActive.selector);
        vault.claimAfterReview();
    }

    function test_ClaimsAfterReviewDeadline() public {
        _submit();
        vm.warp(block.timestamp + reviewPeriod + 1);
        uint256 before = usdc.balanceOf(contractor);

        vm.prank(other);
        vm.expectEmit(true, true, true, true, address(vault));
        emit MilestoneVault.FundsReleased(contractor, amount);
        vault.claimAfterReview();

        assertTrue(vault.state() == MilestoneVault.State.SettledByTimeout);
        assertEq(usdc.balanceOf(contractor), before + amount);
        assertEq(usdc.balanceOf(address(vault)), 0);
    }

    function test_IsPermissionless() public {
        _submit();
        vm.warp(block.timestamp + reviewPeriod + 1);

        vm.prank(client);
        vault.claimAfterReview();
        assertTrue(vault.state() == MilestoneVault.State.SettledByTimeout);
    }

    function test_OnlyFromSubmitted() public {
        _acknowledge();
        vm.prank(other);
        vm.expectRevert(
            abi.encodeWithSelector(MilestoneVault.InvalidState.selector, MilestoneVault.State.Active)
        );
        vault.claimAfterReview();
    }

    function test_RevisionThenResubmitUsesNewReviewDeadline() public {
        _submit();
        vm.warp(block.timestamp + 1 days);
        _revise();
        vm.warp(block.timestamp + 2 days);
        _submit();

        vm.warp(block.timestamp + reviewPeriod - 1);
        vm.prank(other);
        vm.expectRevert(MilestoneVault.ReviewWindowActive.selector);
        vault.claimAfterReview();

        vm.warp(block.timestamp + 1);
        vm.prank(other);
        vault.claimAfterReview();
        assertTrue(vault.state() == MilestoneVault.State.SettledByTimeout);
    }
}

contract RefundTests is MilestoneVaultBase {
    function setUp() public override {
        super.setUp();
        _setUpVault();
    }

    function test_RevertsBeforeSubmitDeadline() public {
        vm.warp(block.timestamp + submissionPeriod - 1);
        vm.prank(client);
        vm.expectRevert(MilestoneVault.SubmitDeadlineActive.selector);
        vault.refundExpired();
    }

    function test_RevertsExactlyAtDeadline() public {
        vm.warp(block.timestamp + submissionPeriod);
        vm.prank(client);
        vm.expectRevert(MilestoneVault.SubmitDeadlineActive.selector);
        vault.refundExpired();
    }

    function test_RefundsAfterContractorInactivity() public {
        vm.warp(block.timestamp + submissionPeriod + 1);
        vm.prank(client);
        vault.refundExpired();

        assertTrue(vault.state() == MilestoneVault.State.RefundedExpired);
        assertEq(usdc.balanceOf(client), 10_000_000e6);
        assertEq(usdc.balanceOf(address(vault)), 0);
    }

    function test_RefundsFromActiveAfterDeadline() public {
        _acknowledge();
        vm.warp(block.timestamp + submissionPeriod + 1);
        vm.prank(client);
        vault.refundExpired();
        assertTrue(vault.state() == MilestoneVault.State.RefundedExpired);
    }

    function test_OnlyClient() public {
        vm.warp(block.timestamp + submissionPeriod + 1);
        vm.prank(contractor);
        vm.expectRevert(MilestoneVault.Unauthorized.selector);
        vault.refundExpired();

        vm.prank(other);
        vm.expectRevert(MilestoneVault.Unauthorized.selector);
        vault.refundExpired();
    }

    function test_OnlyBeforeSubmission() public {
        _submit();
        vm.warp(block.timestamp + reviewPeriod * 2);
        vm.prank(client);
        vm.expectRevert(
            abi.encodeWithSelector(MilestoneVault.InvalidState.selector, MilestoneVault.State.Submitted)
        );
        vault.refundExpired();
    }
}

contract DisputeTests is MilestoneVaultBase {
    function setUp() public override {
        super.setUp();
        _setUpVault();
    }

    function test_BlocksTimeoutRelease() public {
        _submit();
        _dispute();
        vm.warp(block.timestamp + reviewPeriod * 10);

        vm.prank(other);
        vm.expectRevert(
            abi.encodeWithSelector(MilestoneVault.InvalidState.selector, MilestoneVault.State.Disputed)
        );
        vault.claimAfterReview();

        assertTrue(vault.state() == MilestoneVault.State.Disputed);
        assertEq(usdc.balanceOf(address(vault)), amount);
    }

    function test_OnlyClient() public {
        _submit();
        vm.prank(contractor);
        vm.expectRevert(MilestoneVault.Unauthorized.selector);
        vault.dispute();
    }

    function test_OnlyDuringReviewWindow() public {
        _submit();
        vm.warp(block.timestamp + reviewPeriod + 1);
        vm.prank(client);
        vm.expectRevert(MilestoneVault.ReviewWindowExpired.selector);
        vault.dispute();
    }

    function test_OnlyFromSubmitted() public {
        vm.prank(client);
        vm.expectRevert(
            abi.encodeWithSelector(MilestoneVault.InvalidState.selector, MilestoneVault.State.Funded)
        );
        vault.dispute();
    }

    function test_ResolvesViaApprove() public {
        _submit();
        _dispute();
        _approve();
        assertTrue(vault.state() == MilestoneVault.State.Settled);
    }

    function test_ResolvesViaMutualCancel() public {
        _submit();
        _dispute();

        vm.prank(client);
        vault.proposeMutualCancel();
        assertTrue(vault.state() == MilestoneVault.State.Disputed);

        vm.prank(contractor);
        vault.proposeMutualCancel();

        assertTrue(vault.state() == MilestoneVault.State.CancelledMutual);
        assertEq(usdc.balanceOf(client), 10_000_000e6);
    }
}

contract MutualCancelTests is MilestoneVaultBase {
    function setUp() public override {
        super.setUp();
        _setUpVault();
    }

    function test_SingleProposalDoesNotMoveFunds() public {
        vm.prank(client);
        vault.proposeMutualCancel();

        assertTrue(vault.state() == MilestoneVault.State.Funded);
        assertTrue(vault.clientCancelProposed());
        assertFalse(vault.contractorCancelProposed());
        assertEq(usdc.balanceOf(address(vault)), amount);
    }

    function test_BothProposalsRefundClient() public {
        vm.prank(contractor);
        vault.proposeMutualCancel();

        vm.prank(client);
        vm.expectEmit(true, true, true, true, address(vault));
        emit MilestoneVault.MilestoneRefunded(MilestoneVault.RefundReason.MutualCancel);
        vault.proposeMutualCancel();

        assertTrue(vault.state() == MilestoneVault.State.CancelledMutual);
        assertEq(usdc.balanceOf(client), 10_000_000e6);
        assertEq(usdc.balanceOf(address(vault)), 0);
    }

    function test_OnlyParties() public {
        vm.prank(other);
        vm.expectRevert(MilestoneVault.Unauthorized.selector);
        vault.proposeMutualCancel();
    }

    function test_NotFromCreated() public {
        MilestoneVault fresh = _createVault();
        vm.prank(client);
        vm.expectRevert(
            abi.encodeWithSelector(MilestoneVault.InvalidState.selector, MilestoneVault.State.Created)
        );
        fresh.proposeMutualCancel();
    }

    function test_NotFromSubmitted() public {
        _submit();
        vm.prank(client);
        vm.expectRevert(
            abi.encodeWithSelector(MilestoneVault.InvalidState.selector, MilestoneVault.State.Submitted)
        );
        vault.proposeMutualCancel();
    }

    function test_FromRevisionRequested() public {
        _submit();
        _revise();
        vm.prank(contractor);
        vault.proposeMutualCancel();
        vm.prank(client);
        vault.proposeMutualCancel();
        assertTrue(vault.state() == MilestoneVault.State.CancelledMutual);
    }

    function test_NotFromTerminal() public {
        _submit();
        _approve();

        vm.prank(client);
        vm.expectRevert(
            abi.encodeWithSelector(MilestoneVault.InvalidState.selector, MilestoneVault.State.Settled)
        );
        vault.proposeMutualCancel();
    }
}

contract TerminalStateTests is MilestoneVaultBase {
    function _assertAllActionsRevert(MilestoneVault v) internal {
        vm.startPrank(client);
        vm.expectRevert(
            abi.encodeWithSelector(MilestoneVault.InvalidState.selector, v.state())
        );
        v.fundMilestone();
        vm.expectRevert(
            abi.encodeWithSelector(MilestoneVault.InvalidState.selector, v.state())
        );
        v.approveAndRelease();
        vm.expectRevert(
            abi.encodeWithSelector(MilestoneVault.InvalidState.selector, v.state())
        );
        v.requestRevision(reasonHash);
        vm.expectRevert(
            abi.encodeWithSelector(MilestoneVault.InvalidState.selector, v.state())
        );
        v.dispute();
        vm.expectRevert(
            abi.encodeWithSelector(MilestoneVault.InvalidState.selector, v.state())
        );
        v.refundExpired();
        vm.stopPrank();

        vm.startPrank(contractor);
        vm.expectRevert(
            abi.encodeWithSelector(MilestoneVault.InvalidState.selector, v.state())
        );
        v.submitWork(evidenceHash, evidenceURI);
        vm.expectRevert(
            abi.encodeWithSelector(MilestoneVault.InvalidState.selector, v.state())
        );
        v.proposeMutualCancel();
        vm.stopPrank();

        vm.prank(other);
        vm.expectRevert(
            abi.encodeWithSelector(MilestoneVault.InvalidState.selector, v.state())
        );
        v.claimAfterReview();
    }

    function test_NoActionFromSettled() public {
        _setUpVault();
        _submit();
        _approve();
        _assertAllActionsRevert(vault);
    }

    function test_NoActionFromSettledByTimeout() public {
        _setUpVault();
        _submit();
        vm.warp(block.timestamp + reviewPeriod + 1);
        vault.claimAfterReview();
        _assertAllActionsRevert(vault);
    }

    function test_NoActionFromRefundedExpired() public {
        _setUpVault();
        vm.warp(block.timestamp + submissionPeriod + 1);
        vm.prank(client);
        vault.refundExpired();
        _assertAllActionsRevert(vault);
    }

    function test_NoActionFromCancelledMutual() public {
        _setUpVault();
        vm.startPrank(client);
        vault.proposeMutualCancel();
        vm.stopPrank();
        vm.prank(contractor);
        vault.proposeMutualCancel();
        _assertAllActionsRevert(vault);
    }
}

contract HappyPathTest is MilestoneVaultBase {
    function test_FullLifecycle() public {
        MilestoneVaultFactory factory = new MilestoneVaultFactory();

        vm.startPrank(client);
        address vaultAddr = factory.createMilestone(
            contractor, address(usdc), amount, scopeHash, metadataURI, submissionPeriod, reviewPeriod
        );
        usdc.approve(vaultAddr, amount);
        MilestoneVault(vaultAddr).fundMilestone();
        vm.stopPrank();

        assertEq(usdc.balanceOf(vaultAddr), amount);

        vm.prank(contractor);
        MilestoneVault(vaultAddr).acknowledgeStart();

        vm.warp(block.timestamp + 2 days);
        vm.prank(contractor);
        MilestoneVault(vaultAddr).submitWork(evidenceHash, evidenceURI);

        vm.prank(client);
        MilestoneVault(vaultAddr).approveAndRelease();

        assertTrue(MilestoneVault(vaultAddr).state() == MilestoneVault.State.Settled);
        assertEq(usdc.balanceOf(contractor), amount);
        assertEq(usdc.balanceOf(vaultAddr), 0);
        assertEq(factory.vaultCount(), 1);
        assertEq(factory.allVaults()[0], vaultAddr);
    }
}
