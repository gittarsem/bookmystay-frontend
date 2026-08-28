import jsPDF from "jspdf";
import type { BookingDetails } from "@/types";

/**
 * Load an image from the public folder.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();

        image.onload = () => resolve(image);
        image.onerror = () =>
            reject(new Error(`Unable to load image: ${src}`));

        image.src = src;
    });
}

/**
 * Generate a professional hotel-booking voucher PDF.
 */
export async function generateBookingReceipt(
    booking: BookingDetails
) {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const left = 14;
    const right = pageWidth - 14;
    const contentWidth = right - left;

    let y = 14;

    /*
     * IMPORTANT
     *
     * Only hourly bookings should display time.
     */
    const isHourly =
        booking.bookingMode === "HOURLY";

    // =========================================================
    // LOAD LOGO
    // =========================================================

    try {
        const logo = await loadImage("/logo.png");

        doc.addImage(
            logo,
            "PNG",
            left,
            y - 4,
            38,
            12
        );
    } catch (error) {
        console.error(
            "Unable to load BookMyStay logo:",
            error
        );

        // Fallback if logo cannot be loaded
        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(18);

        doc.setTextColor(
            180,
            105,
            45
        );

        doc.text(
            "BookMyStay",
            left,
            y + 3
        );
    }

    // =========================================================
    // HEADER TITLE
    // =========================================================

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(10);

    doc.setTextColor(
        70,
        70,
        70
    );

    doc.text(
        "Hotel Booking Voucher",
        right,
        y + 2,
        {
            align: "right",
        }
    );

    y += 12;

    drawLine();

    // =========================================================
    // HOTEL INFORMATION
    // =========================================================

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(13);

    doc.setTextColor(
        45,
        30,
        25
    );

    doc.text(
        booking.hotelName || "Hotel",
        left,
        y
    );

    y += 5;

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(8);

    doc.setTextColor(
        100,
        100,
        100
    );

    doc.text(
        booking.city || "",
        left,
        y
    );

    y += 8;

    // =========================================================
    // BASIC BOOKING INFORMATION
    // =========================================================

    const col1 = left;
    const col2 = left + 62;
    const col3 = left + 124;

    drawLabel(
        "BOOKING ID",
        col1,
        y
    );

    drawValue(
        `#${booking.bookingId}`,
        col1,
        y + 5,
        true
    );

    drawLabel(
        "CHECK IN",
        col2,
        y
    );

    drawValue(
        formatDate(
            booking.checkInDate
        ),
        col2,
        y + 5,
        true
    );

    drawLabel(
        "CHECK OUT",
        col3,
        y
    );

    drawValue(
        formatDate(
            booking.checkOutDate
        ),
        col3,
        y + 5,
        true
    );

    /*
     * HOURLY TIME
     *
     * DAILY:
     * No time is displayed.
     *
     * HOURLY:
     * Check-in and check-out times are displayed.
     */
    if (
        isHourly &&
        booking.checkInTime &&
        booking.checkOutTime
    ) {
        y += 14;

        drawLabel(
            "CHECK-IN TIME",
            col1,
            y
        );

        drawValue(
            formatTime(
                booking.checkInTime
            ),
            col1,
            y + 5,
            true
        );

        drawLabel(
            "CHECK-OUT TIME",
            col2,
            y
        );

        drawValue(
            formatTime(
                booking.checkOutTime
            ),
            col2,
            y + 5,
            true
        );

        drawLabel(
            "BOOKING MODE",
            col3,
            y
        );

        drawValue(
            "HOURLY",
            col3,
            y + 5,
            true
        );
    }

    y += 14;

    drawLine();

    // =========================================================
    // BOOKING DETAILS
    // =========================================================

    drawSectionTitle(
        "Booking Details",
        left,
        y
    );

    y += 7;

    drawLabel(
        "ROOM TYPE",
        col1,
        y
    );

    drawValue(
        String(
            booking.roomType ?? "-"
        ),
        col1,
        y + 5,
        true
    );

    drawLabel(
        "ADULTS",
        col2,
        y
    );

    drawValue(
        String(
            booking.adultCount ?? 0
        ),
        col2,
        y + 5,
        true
    );

    drawLabel(
        "CHILDREN",
        col3,
        y
    );

    drawValue(
        String(
            booking.childCount ?? 0
        ),
        col3,
        y + 5,
        true
    );

    y += 14;

    // =========================================================
    // PAYMENT DETAILS
    // =========================================================

    drawSectionTitle(
        "Payment Details",
        left,
        y
    );

    y += 7;

    drawLabel(
        "PAYMENT STATUS",
        col1,
        y
    );

    drawValue(
        String(
            booking.paymentStatus ?? "-"
        ),
        col1,
        y + 5,
        true
    );

    drawLabel(
        "BOOKING STATUS",
        col2,
        y
    );

    drawValue(
        String(
            booking.bookingStatus ?? "-"
        ),
        col2,
        y + 5,
        true
    );

    drawLabel(
        "AMOUNT PAID",
        col3,
        y
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(10);

    doc.setTextColor(
        20,
        140,
        70
    );

    doc.text(
        `INR ${formatAmount(
            booking.amount
        )}`,
        col3,
        y + 5
    );

    y += 14;

    drawLine();

    // =========================================================
    // GUEST DETAILS
    // =========================================================

    drawSectionTitle(
        "Guest Details",
        left,
        y
    );

    y += 7;

    if (
        booking.guests &&
        booking.guests.length > 0
    ) {

        // Guest table headers

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(7.5);

        doc.setTextColor(
            100,
            100,
            100
        );

        doc.text(
            "GUEST",
            left,
            y
        );

        doc.text(
            "GENDER",
            col2,
            y
        );

        doc.text(
            "AGE",
            col3,
            y
        );

        y += 5;

        booking.guests.forEach(
            (guest, index) => {

                doc.setFont(
                    "helvetica",
                    "normal"
                );

                doc.setFontSize(8.5);

                doc.setTextColor(
                    45,
                    45,
                    45
                );

                doc.text(
                    `${index + 1}. ${guest.name}`,
                    left,
                    y
                );

                doc.text(
                    String(
                        guest.gender ?? "-"
                    ),
                    col2,
                    y
                );

                doc.text(
                    String(
                        guest.age ?? "-"
                    ),
                    col3,
                    y
                );

                y += 6;
            }
        );

    } else {

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(8);

        doc.setTextColor(
            100,
            100,
            100
        );

        doc.text(
            "No guest details were added.",
            left,
            y
        );

        y += 6;
    }

    y += 3;

    drawLine();

    // =========================================================
    // PAYMENT SUMMARY
    // =========================================================

    drawSectionTitle(
        "Payment Summary",
        left,
        y
    );

    y += 8;

    drawLabel(
        "Total Booking Amount",
        left,
        y
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(9);

    doc.setTextColor(
        45,
        45,
        45
    );

    doc.text(
        `INR ${formatAmount(
            booking.amount
        )}`,
        right,
        y,
        {
            align: "right",
        }
    );

    y += 7;

    // =========================================================
    // AMOUNT PAID BOX
    // =========================================================

    doc.setFillColor(
        248,
        245,
        240
    );

    doc.roundedRect(
        left,
        y,
        contentWidth,
        14,
        2,
        2,
        "F"
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(10);

    doc.setTextColor(
        45,
        30,
        25
    );

    doc.text(
        "Amount Paid",
        left + 5,
        y + 9
    );

    doc.setFontSize(12);

    doc.setTextColor(
        20,
        140,
        70
    );

    doc.text(
        `INR ${formatAmount(
            booking.amount
        )}`,
        right - 5,
        y + 9,
        {
            align: "right",
        }
    );

    y += 21;

    drawLine();

    // =========================================================
    // IMPORTANT NOTE
    // =========================================================

    drawSectionTitle(
        "Important Note",
        left,
        y
    );

    y += 6;

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(7.5);

    doc.setTextColor(
        80,
        80,
        80
    );

    const importantNote =
        "Please present this booking voucher along with a valid government-issued ID at check-in. " +
        "Hotel check-in and cancellation policies are subject to the property's applicable terms.";

    const noteLines =
        doc.splitTextToSize(
            importantNote,
            contentWidth
        );

    doc.text(
        noteLines,
        left,
        y
    );

    y +=
        noteLines.length * 4 +
        4;

    drawLine();

    // =========================================================
    // BOOKING TERMS
    // =========================================================

    drawSectionTitle(
        "Booking Terms",
        left,
        y
    );

    y += 6;

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(7.2);

    doc.setTextColor(
        90,
        90,
        90
    );

    const terms = [
        "• Guest details should match the identification presented at check-in.",
        "• Check-in and check-out are subject to the hotel's applicable policies.",
        "• Cancellation and refund eligibility depend on the booking status and applicable policy.",
        "• Please retain this receipt for your records.",
    ];

    terms.forEach(
        (term) => {

            doc.text(
                term,
                left,
                y
            );

            y += 4.5;
        }
    );

    y += 4;

    drawLine();

    // =========================================================
    // BOOKMYSTAY APPROVED STAMP
    // =========================================================

    drawApprovalStamp();

    // =========================================================
    // FOOTER
    // =========================================================

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(8);

    doc.setTextColor(
        45,
        30,
        25
    );

    doc.text(
        "BookMyStay",
        left,
        pageHeight - 14
    );

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(7);

    doc.setTextColor(
        110,
        110,
        110
    );

    doc.text(
        `Generated on ${new Date().toLocaleDateString(
            "en-IN"
        )}`,
        right,
        pageHeight - 14,
        {
            align: "right",
        }
    );

    // =========================================================
    // DOWNLOAD
    // =========================================================

    doc.save(
        `BookMyStay-Booking-Voucher-${booking.bookingId}.pdf`
    );

    // =========================================================
    // LOCAL HELPERS
    // =========================================================

    function drawLine() {

        doc.setDrawColor(
            150,
            150,
            150
        );

        doc.setLineWidth(
            0.3
        );

        doc.line(
            left,
            y,
            right,
            y
        );

        y += 5;
    }

    function drawSectionTitle(
        text: string,
        x: number,
        yPosition: number
    ) {

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(10);

        doc.setTextColor(
            45,
            30,
            25
        );

        doc.text(
            text,
            x,
            yPosition
        );
    }

    function drawLabel(
        text: string,
        x: number,
        yPosition: number
    ) {

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(7.5);

        doc.setTextColor(
            110,
            110,
            110
        );

        doc.text(
            text,
            x,
            yPosition
        );
    }

    function drawValue(
        text: string,
        x: number,
        yPosition: number,
        bold = false
    ) {

        doc.setFont(
            "helvetica",
            bold
                ? "bold"
                : "normal"
        );

        doc.setFontSize(8.5);

        doc.setTextColor(
            40,
            40,
            40
        );

        doc.text(
            text,
            x,
            yPosition
        );
    }

    // =========================================================
    // APPROVAL STAMP
    // =========================================================

    function drawApprovalStamp() {

        /*
         * Position the stamp below the receipt content.
         */
        const stampX =
            pageWidth / 2;

        const stampY =
            y + 8;

        /*
         * Outer circle
         */
        doc.setDrawColor(
            20,
            140,
            70
        );

        doc.setLineWidth(
            1.2
        );

        doc.circle(
            stampX,
            stampY,
            18,
            "S"
        );

        /*
         * Inner circle
         */
        doc.setLineWidth(
            0.5
        );

        doc.circle(
            stampX,
            stampY,
            15.5,
            "S"
        );

        /*
         * APPROVED
         */
        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(9);

        doc.setTextColor(
            20,
            140,
            70
        );

        doc.text(
            "APPROVED",
            stampX,
            stampY - 2,
            {
                align: "center",
            }
        );

        /*
         * BOOKMYSTAY
         */
        doc.setFontSize(6.5);

        doc.text(
            "BOOKMYSTAY",
            stampX,
            stampY + 3,
            {
                align: "center",
            }
        );

        /*
         * Small check mark
         */
        doc.setFontSize(7);

        doc.text(
            "✓",
            stampX,
            stampY + 8,
            {
                align: "center",
            }
        );
    }
}

// =============================================================
// DATE FORMAT
// =============================================================

function formatDate(
    date: string
) {

    if (!date) {
        return "-";
    }

    /*
     * Parse the date safely without
     * accidentally shifting it because
     * of timezone conversion.
     */
    const parts =
        date.split("-");

    if (parts.length !== 3) {
        return date;
    }

    const year =
        Number(parts[0]);

    const month =
        Number(parts[1]) - 1;

    const day =
        Number(parts[2]);

    const localDate =
        new Date(
            year,
            month,
            day
        );

    return localDate.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
}

// =============================================================
// TIME FORMAT
// =============================================================

function formatTime(
    time: string
) {

    if (!time) {
        return "-";
    }

    /*
     * Backend returns:
     *
     * 15:43:00
     *
     * Display:
     *
     * 03:43 PM
     */
    const parts =
        time.split(":");

    if (parts.length < 2) {
        return time;
    }

    const hours =
        Number(parts[0]);

    const minutes =
        Number(parts[1]);

    if (
        Number.isNaN(hours) ||
        Number.isNaN(minutes)
    ) {
        return time;
    }

    const suffix =
        hours >= 12
            ? "PM"
            : "AM";

    const displayHour =
        hours % 12 || 12;

    return `${String(
        displayHour
    ).padStart(2, "0")}:${String(
        minutes
    ).padStart(2, "0")} ${suffix}`;
}

// =============================================================
// AMOUNT FORMAT
// =============================================================

function formatAmount(
    amount: unknown
) {

    return Number(
        amount ?? 0
    ).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    );
}