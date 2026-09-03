import api from "./axios";

/* =========================================================
   ENUMS
   ========================================================= */

export type GovernmentIdType =
  | "AADHAAR"
  | "PASSPORT"
  | "DRIVING_LICENSE"
  | "VOTER_ID";

export type VerificationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";


/* =========================================================
   APPLICATION REQUEST
   ========================================================= */

export interface OwnerApplicationRequest {
  governmentIdType: GovernmentIdType;
  governmentIdNumber: string;
  businessName: string;
  phoneNumber: string;
  businessAddress: string;

  governmentIdFront: File;
  governmentIdBack: File;
}


/* =========================================================
   RESUBMIT REQUEST
   ========================================================= */

export interface OwnerVerificationResubmitRequest {
  businessName: string;
  businessAddress: string;
  phoneNumber: string;

  governmentIdType: GovernmentIdType;
  governmentIdNumber: string;

  governmentIdFront: File;
  governmentIdBack: File;
}


/* =========================================================
   RESPONSE
   ========================================================= */

export interface OwnerVerificationResponse {
  id: number;

  applicantName: string;
  applicantEmail: string;

  governmentIdType: GovernmentIdType;
  governmentIdNumber: string;

  businessName: string;
  phoneNumber: string;
  businessAddress: string;

  verificationStatus: VerificationStatus;

  submittedAt: string;

  rejectionReason?: string;

  governmentIdFrontUrl?: string;
  governmentIdBackUrl?: string;
}


/* =========================================================
   API
   ========================================================= */

export const ownerVerificationApi = {

  /* =======================================================
     APPLY

     POST /apply/owner
     Content-Type: multipart/form-data
  ======================================================= */

  apply(
    data: OwnerApplicationRequest
  ) {
    const formData = new FormData();

    formData.append(
      "governmentIdType",
      data.governmentIdType
    );

    formData.append(
      "governmentIdNumber",
      data.governmentIdNumber
    );

    formData.append(
      "businessName",
      data.businessName
    );

    formData.append(
      "phoneNumber",
      data.phoneNumber
    );

    formData.append(
      "businessAddress",
      data.businessAddress
    );

    formData.append(
      "governmentIdFront",
      data.governmentIdFront,
      data.governmentIdFront.name
    );

    formData.append(
      "governmentIdBack",
      data.governmentIdBack,
      data.governmentIdBack.name
    );

    return api.post<string>(
      "/apply/owner",
      formData
    );
  },


  /* =======================================================
     GET MY VERIFICATION

     GET /apply/verification
  ======================================================= */

  getMyVerification() {
    return api.get<OwnerVerificationResponse>(
      "/apply/verification"
    );
  },


  /* =======================================================
     RESUBMIT

     POST /apply/verification/resubmit
     Content-Type: multipart/form-data
  ======================================================= */

  resubmit(
    data: OwnerVerificationResubmitRequest
  ) {
    const formData = new FormData();

    formData.append(
      "businessName",
      data.businessName
    );

    formData.append(
      "businessAddress",
      data.businessAddress
    );

    formData.append(
      "phoneNumber",
      data.phoneNumber
    );

    formData.append(
      "governmentIdType",
      data.governmentIdType
    );

    formData.append(
      "governmentIdNumber",
      data.governmentIdNumber
    );

    formData.append(
      "governmentIdFront",
      data.governmentIdFront,
      data.governmentIdFront.name
    );

    formData.append(
      "governmentIdBack",
      data.governmentIdBack,
      data.governmentIdBack.name
    );

    return api.post<void>(
      "/apply/verification/resubmit",
      formData
    );
  },
};