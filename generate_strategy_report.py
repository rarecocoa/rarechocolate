import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas
from pypdf import PdfReader

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            return

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#554841"))

        # Header: Clean and minimal
        self.drawString(54, 746, "Rare Cocoa  |  Business Analysis & Decision Guide")
        self.setFont("Helvetica", 8)
        self.drawRightString(612 - 54, 746, "Payment Gateway, Ops Dashboard & WhatsApp")
        self.setStrokeColor(colors.HexColor("#D4C4B8"))
        self.setLineWidth(0.6)
        self.line(54, 740, 612 - 54, 740)

        # Footer: Strictly Rare Cocoa • Page X of Y
        self.line(54, 46, 612 - 54, 46)
        self.drawString(54, 34, "Rare Cocoa")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(612 - 54, 34, page_text)
        self.restoreState()


def build_pdf(filename="Rare_Cocoa_ECommerce_Payment_Automation_Strategy.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=56,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()

    # Brand Palette
    PRIMARY = colors.HexColor("#1A0E08")       # Deep Brown
    SECONDARY = colors.HexColor("#5C3119")     # Warm Brown
    ACCENT = colors.HexColor("#B87333")        # Copper Accent
    LIGHT_BG = colors.HexColor("#FBF9F6")      # Soft Cream
    CARD_BG = colors.HexColor("#F5EFEA")       # Warm Tint
    TEXT_DARK = colors.HexColor("#241E1C")     # Charcoal Text
    TEXT_MUTED = colors.HexColor("#6B5E57")    # Muted
    BORDER_COLOR = colors.HexColor("#D8C9BD")  # Clean Line
    DANGER = colors.HexColor("#9E2A2B")        # Red
    SUCCESS = colors.HexColor("#2A6F4E")       # Green

    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=21,
        leading=26,
        textColor=PRIMARY,
        spaceAfter=8
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=16,
        textColor=SECONDARY,
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12.5,
        leading=16,
        textColor=PRIMARY,
        spaceBefore=0,
        spaceAfter=5,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=SECONDARY,
        spaceBefore=6,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=TEXT_DARK,
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=12,
        textColor=TEXT_DARK,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3
    )

    callout_style = ParagraphStyle(
        'Callout_Text',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11.5,
        textColor=PRIMARY
    )

    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10.5,
        textColor=TEXT_DARK
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=10.5,
        textColor=PRIMARY
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=10.5,
        textColor=colors.white
    )

    def create_box(text, title="KEY TAKEAWAY", bg=CARD_BG, border_col=ACCENT, pad=5):
        content = [
            Paragraph(f"<b>{title}</b>", ParagraphStyle('BoxT', fontName='Helvetica-Bold', fontSize=8, leading=10, textColor=border_col)),
            Spacer(1, 2),
            Paragraph(text, callout_style)
        ]
        t = Table([[content]], colWidths=[504])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), bg),
            ('BOX', (0,0), (-1,-1), 0.5, border_col),
            ('LINEBEFORE', (0,0), (0,-1), 3, border_col),
            ('TOPPADDING', (0,0), (-1,-1), pad),
            ('BOTTOMPADDING', (0,0), (-1,-1), pad),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        return t

    story = []

    # =========================================================================
    # PAGE 1: COVER & CURRENT REALITY
    # =========================================================================
    story.append(Spacer(1, 14))
    story.append(Paragraph("RARE COCOA", ParagraphStyle('BrandTop', fontName='Helvetica-Bold', fontSize=14, leading=17, textColor=ACCENT, spaceAfter=4)))
    story.append(Paragraph("BUSINESS ANALYSIS & DECISION GUIDE", ParagraphStyle('BrandSub', fontName='Helvetica-Bold', fontSize=9, leading=12, textColor=TEXT_MUTED, spaceAfter=12)))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceAfter=14))

    story.append(Paragraph("BUSINESS ANALYSIS & DECISION GUIDE", title_style))
    story.append(Paragraph("An Honest Comparison of Website Payment Gateways, WhatsApp Options, and the Ops Dashboard (ops.rarecocoa.com) for Rare Cocoa", subtitle_style))

    meta_table_data = [
        [Paragraph("<b>Brand:</b>", table_cell_bold), Paragraph("Rare Cocoa (rarecocoa.com)", table_cell)],
        [Paragraph("<b>Question from Client:</b>", table_cell_bold), Paragraph("Can we add Razorpay / Cashfree directly to the website easily?", table_cell)],
        [Paragraph("<b>Current Reality:</b>", table_cell_bold), Paragraph("No WhatsApp API is connected yet. The Ops Dashboard (ops.rarecocoa.com) is currently not receiving orders.", table_cell)],
        [Paragraph("<b>Goal of this Guide:</b>", table_cell_bold), Paragraph("Explain how to connect payments and WhatsApp so orders actually reach the Ops Dashboard properly.", table_cell)],
    ]
    meta_table = Table(meta_table_data, colWidths=[120, 384])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
        ('RIGHTPADDING', (0,0), (-1,-1), 7),
    ]))
    story.append(meta_table)

    story.append(Spacer(1, 14))
    story.append(Paragraph("<b>THE TRUTH ABOUT WHERE THE SYSTEM STANDS TODAY</b>", h2_style))
    story.append(Paragraph(
        "Your client wants to know if they can integrate Razorpay or Cashfree directly on the website without much effort. To answer that honestly, we must look at the real facts of how Rare Cocoa is set up today:",
        body_style
    ))
    story.append(Paragraph(
        "1. <b>The Website:</b> Works properly. Customers pick chocolates, select sweeteners, choose toppings, and click to order.<br/>"
        "2. <b>The WhatsApp Chat:</b> Currently opens as a normal WhatsApp message on the phone. <b>No API (neither Meta nor AiSensy) has been connected to that number yet.</b><br/>"
        "3. <b>The Ops Dashboard (`ops.rarecocoa.com`):</b> The dashboard exists, but <b>it is currently not working / receiving zero orders</b>. Why? Because without an API connected to WhatsApp, the dashboard has no way of hearing about any orders that customers send!",
        body_style
    ))
    story.append(Paragraph(
        "Connecting an API is the <b>only way</b> to make `ops.rarecocoa.com` actually track orders. This guide breaks down all options so the client can make the right business choice.",
        body_style
    ))

    story.append(Spacer(1, 8))
    story.append(create_box(
        "<b>Direct Answer for the Client:</b> If you add Razorpay directly on the website, money goes into Razorpay, but your Ops Dashboard remains 100% blank because it has no order ingest pipeline. To make your Ops Dashboard actually work and track orders, you must connect an API to WhatsApp. This guide shows the best way to do that.",
        title="EXECUTIVE SUMMARY IN PLAIN WORDS",
        pad=6
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 2: PART 1 - HOW RARE COCOA WEBSITE WORKS & DELIVERY REGIONS
    # =========================================================================
    story.append(Paragraph("1. HOW THE RARE COCOA STORE & REGIONS WORK TODAY", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=BORDER_COLOR, spaceAfter=8))

    story.append(Paragraph("1.1 Custom Orders on the Website", h2_style))
    story.append(Paragraph(
        "The Rare Cocoa website is custom-coded for custom orders. Unlike stores selling fixed items like phone cases, Rare Cocoa lets customers customize their chocolates:",
        body_style
    ))
    story.append(Paragraph("• <b>Sweetener Choices:</b> Customers choose between Organic Raw Sugar, Monk Fruit, or Jaggery.", bullet_style))
    story.append(Paragraph("• <b>Inclusions & Toppings:</b> Roasted nuts, seeds, and custom flavor additions.", bullet_style))
    story.append(Paragraph("• <b>Gifting Details:</b> Customers can order for themselves or enter receiver name, phone, and sender info for gifts.", bullet_style))

    story.append(Paragraph("1.2 The 4 Delivery Regions on the Website", h2_style))
    story.append(Paragraph(
        "The website checkout calculates delivery fees based on 4 distinct regional delivery choices:",
        body_style
    ))

    delivery_map_data = [
        [Paragraph("<b>Delivery Region</b>", table_header), Paragraph("<b>Delivery Fee</b>", table_header), Paragraph("<b>How it is Delivered</b>", table_header), Paragraph("<b>Website Requirements</b>", table_header)],
        [Paragraph("<b>1. Vijayawada</b><br/>(City Limits)", table_cell_bold), Paragraph("₹30", table_cell), Paragraph("Local delivery within city limits.", table_cell), Paragraph("Standard address and phone number.", table_cell)],
        [Paragraph("<b>2. Hyderabad</b>", table_cell_bold), Paragraph("₹200", table_cell), Paragraph("Personal delivery across Hyderabad.", table_cell), Paragraph("Must select Area Name from dropdown + optional Google Maps pin.", table_cell)],
        [Paragraph("<b>3. Andhra - Telangana</b>", table_cell_bold), Paragraph("₹200", table_cell), Paragraph("Direct bus transport connectivity.", table_cell), Paragraph("City name, full address, and pincode.", table_cell)],
        [Paragraph("<b>4. Other States</b><br/>(Rest of India)", table_cell_bold), Paragraph("₹200", table_cell), Paragraph("Standard courier delivery across India.", table_cell), Paragraph("Only shelf-stable chocolate items allowed.", table_cell)],
    ]
    del_t = Table(delivery_map_data, colWidths=[95, 60, 185, 164])
    del_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(del_t)

    story.append(Spacer(1, 8))
    story.append(Paragraph("1.3 The Ops Dashboard Reality: Why it is Currently Inactive", h2_style))
    story.append(Paragraph(
        "Right now, when a customer finishes checkout, the website opens WhatsApp with a pre-filled message. The customer sends this text directly to the phone number.",
        body_style
    ))
    story.append(Paragraph(
        "Because <b>no API is currently connected to that number</b>, the message only exists on that phone. The Ops Dashboard (`ops.rarecocoa.com`) has no webhook listening to it. That is why the dashboard cannot see any incoming orders today.",
        body_style
    ))

    story.append(Spacer(1, 6))
    story.append(create_box(
        "To make the Ops Dashboard work, Rare Cocoa must connect an API to receive order messages. Adding a payment gateway to the website does not connect WhatsApp to the dashboard.",
        title="OPERATIONAL TAKEAWAY",
        border_col=SECONDARY
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 3: PART 2 - SCENARIO 1: PAYMENT IN WEBSITE
    # =========================================================================
    story.append(Paragraph("2. SCENARIO 1: PAYMENT IN WEBSITE (RAZORPAY / CASHFREE)", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=BORDER_COLOR, spaceAfter=8))

    story.append(Paragraph("2.1 How Payment in Website Works", h2_style))
    story.append(Paragraph(
        "In this scenario, a Razorpay or Cashfree payment popup is added directly inside the website. When the customer clicks 'Pay Now', a popup window opens on the site, the customer pays via UPI, card, or net banking, and sees a success screen.",
        body_style
    ))

    scen1_flow = [
        [Paragraph("<b>Step</b>", table_header), Paragraph("<b>Customer Action</b>", table_header), Paragraph("<b>System Event</b>", table_header)],
        [Paragraph("Step 1", table_cell_bold), Paragraph("Selects chocolates, sweetener, toppings.", table_cell), Paragraph("Cart calculates items and adds delivery fee.", table_cell)],
        [Paragraph("Step 2", table_cell_bold), Paragraph("Clicks 'Pay Now' on website checkout.", table_cell), Paragraph("Razorpay / Cashfree popup window opens.", table_cell)],
        [Paragraph("Step 3", table_cell_bold), Paragraph("Customer pays using GPay, PhonePe, or Card.", table_cell), Paragraph("Payment gateway charges the customer's bank.", table_cell)],
        [Paragraph("Step 4", table_cell_bold), Paragraph("Sees 'Payment Successful' screen.", table_cell), Paragraph("Gateway keeps 2.4% fee and holds the money.", table_cell)],
    ]
    s1_t = Table(scen1_flow, colWidths=[45, 205, 254])
    s1_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(s1_t)

    story.append(Paragraph("2.2 The Big Problem: The Ops Dashboard Still Will Not Work", h2_style))
    story.append(Paragraph(
        "Payment gateways only handle money. Razorpay does NOT automatically send your order details into your custom dashboard.",
        body_style
    ))
    story.append(Paragraph(
        "When the customer pays on the website, Razorpay sends an email: <i>'You received ₹1,450 from Ramesh'</i>. But Razorpay does not record which chocolate bar, what sweetener, or what toppings were ordered. And because the website has no database connection after payment, <b>the Ops Dashboard (`ops.rarecocoa.com`) will still receive ZERO orders</b>. You will have money in the bank, but no order list in your kitchen dashboard!",
        body_style
    ))

    story.append(Paragraph("2.3 Non-Refundable Gateway Fees on Cancellations", h2_style))
    story.append(Paragraph(
        "Payment gateways charge around <b>2.4% on every transaction</b>. If someone enters an unserviceable delivery address or wrong details, you must refund them:",
        body_style
    ))
    story.append(Paragraph("• Customer pays ₹2,000 on the website.", bullet_style))
    story.append(Paragraph("• Razorpay takes ₹48 as their commission fee right away.", bullet_style))
    story.append(Paragraph("• The order cannot be delivered, so you refund ₹2,000 to the customer.", bullet_style))
    story.append(Paragraph("• <b>Razorpay does NOT return the ₹48 fee.</b> Rare Cocoa loses ₹48 directly.", bullet_style))

    story.append(Spacer(1, 4))
    story.append(create_box(
        "<b>Scenario 1 Verdict:</b> Putting payment directly on the website does NOT make your Ops Dashboard work. The dashboard stays blank, and Rare Cocoa loses non-refundable fees whenever orders are canceled.",
        title="SCENARIO 1 RESULT: DASHBOARD WILL NOT WORK",
        border_col=DANGER,
        bg=colors.HexColor("#FFF8F8"),
        pad=5
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 4: PART 3 - SCENARIO 2: CURRENT WHATSAPP (MANUAL, NO API)
    # =========================================================================
    story.append(Paragraph("3. SCENARIO 2: CURRENT WHATSAPP (MANUAL, NO API CONNECTED)", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=BORDER_COLOR, spaceAfter=8))

    story.append(Paragraph("3.1 How the Current Store Operates Today", h2_style))
    story.append(Paragraph(
        "This is the exact setup active on the Rare Cocoa website today:",
        body_style
    ))

    scen2_flow = [
        [Paragraph("<b>Step</b>", table_header), Paragraph("<b>Customer Action</b>", table_header), Paragraph("<b>What Actually Happens</b>", table_header)],
        [Paragraph("1. Build Cart", table_cell_bold), Paragraph("Picks chocolates, sweetener (raw sugar/monk fruit), toppings.", table_cell), Paragraph("Website calculates totals and minimum quantities.", table_cell)],
        [Paragraph("2. Pick Region", table_cell_bold), Paragraph("Selects Vijayawada, Hyderabad, AP/TS, or Other States.", table_cell), Paragraph("Website adds the exact ₹30 or ₹200 fee.", table_cell)],
        [Paragraph("3. Enter Info", table_cell_bold), Paragraph("Enters name, phone, address, and Google Maps pin.", table_cell), Paragraph("Website bundles everything into a structured text message.", table_cell)],
        [Paragraph("4. WhatsApp", table_cell_bold), Paragraph("Clicks 'Place Order' -> opens normal WhatsApp chat.", table_cell), Paragraph("Message lands on the owner's phone as regular text.", table_cell)],
        [Paragraph("5. Pay via UPI", table_cell_bold), Paragraph("Customer scans the store's UPI QR code / GPay / PhonePe.", table_cell), Paragraph("Money goes directly into Rare Cocoa's bank with 0% fee.", table_cell)],
    ]
    s2_t = Table(scen2_flow, colWidths=[65, 205, 234])
    s2_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(s2_t)

    story.append(Paragraph("3.2 The Reality: The Ops Dashboard WILL NOT WORK in Scenario 2", h2_style))
    story.append(Paragraph(
        "<b>In this scenario, the Ops Dashboard (`ops.rarecocoa.com`) DOES NOT WORK at all.</b>",
        body_style
    ))
    story.append(Paragraph(
        "Because no API is connected to the WhatsApp number, every order is just a normal personal chat message. The server hosting the dashboard never receives the data. The dashboard stays completely empty, and staff must read every order from the phone screen manually.",
        body_style
    ))

    story.append(Paragraph("3.3 The Pros of Scenario 2", h2_style))
    story.append(Paragraph("• <b>0.0% Payment Fee:</b> Direct UPI keeps 100% of every rupee. No 2.4% gateway deductions.", bullet_style))
    story.append(Paragraph("• <b>All Details in One Chat:</b> Address, toppings, sweetener, Google Maps pin, and payment proof all in one place.", bullet_style))
    story.append(Paragraph("• <b>Zero Software Costs:</b> No monthly fees to any tool.", bullet_style))

    story.append(Paragraph("3.4 The Cons of Scenario 2", h2_style))
    story.append(Paragraph("• <b>Ops Dashboard will not work:</b> Zero automated order tracking.", bullet_style))
    story.append(Paragraph("• <b>Manual Verification:</b> Staff must check payment screenshots manually.", bullet_style))

    story.append(Spacer(1, 4))
    story.append(create_box(
        "<b>Scenario 2 Verdict:</b> Great for keeping costs at ₹0, but your Ops Dashboard will not work at all until an API is connected to WhatsApp.",
        title="SCENARIO 2 RESULT: DASHBOARD WILL NOT WORK (MANUAL ONLY)",
        border_col=SECONDARY,
        bg=CARD_BG,
        pad=5
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 5: PART 4 - SCENARIO 3: USING AISENSY
    # =========================================================================
    story.append(Paragraph("4. SCENARIO 3: USING AISENSY (DASHBOARD ACTIVE + PHONE APP)", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=BORDER_COLOR, spaceAfter=8))

    story.append(Paragraph("4.1 How AiSensy Makes the Ops Dashboard Work", h2_style))
    story.append(Paragraph(
        "AiSensy is an official WhatsApp partner platform. When you connect your WhatsApp number to AiSensy:",
        body_style
    ))
    story.append(Paragraph(
        "1. The customer sends their order from the website into WhatsApp.<br/>"
        "2. AiSensy catches the message and <b>automatically forwards it to your Ops Dashboard</b> (`ops.rarecocoa.com/api/webhook`) via an Outbound Webhook.<br/>"
        "3. <b>Your Ops Dashboard FINALLY TURNS ON!</b> The order appears on your screen as 'Waiting for Payment'.<br/>"
        "4. AiSensy automatically sends the customer a Razorpay payment link.<br/>"
        "5. Once paid, the Ops Dashboard automatically updates to 'Paid / In Kitchen'!",
        body_style
    ))

    story.append(Paragraph("4.2 The Major Advantage: You Keep WhatsApp on Your Phone", h2_style))
    story.append(Paragraph(
        "This is the biggest benefit of AiSensy:<br/>"
        "• The owner and staff <b>install the AiSensy app on their smartphones</b>.<br/>"
        "• If a customer texts: <i>'Can you add a birthday note?'</i>, your phone pings. You open the app and type a reply just like regular WhatsApp.<br/>"
        "• If a customer calls, it rings on your phone.<br/>"
        "• The bot pauses while a human is chatting, so the customer gets personal care.",
        body_style
    ))

    story.append(Paragraph("4.3 Monthly Costs for Scenario 3", h2_style))

    aisensy_cost_data = [
        [Paragraph("<b>Cost Category</b>", table_header), Paragraph("<b>Amount (Approx.)</b>", table_header), Paragraph("<b>What You Get For It</b>", table_header)],
        [Paragraph("AiSensy Monthly Plan", table_cell_bold), Paragraph("₹1,500 to ₹2,500 / month", table_cell), Paragraph("Mobile team app, bot builder, and webhook forwarding to dashboard.", table_cell)],
        [Paragraph("Meta Message Fee", table_cell_bold), Paragraph("₹0.40 to ₹0.80 / customer", table_cell), Paragraph("Meta's standard charge per 24-hour conversation window.", table_cell)],
        [Paragraph("Razorpay Commission", table_cell_bold), Paragraph("2.0% to 2.4% + GST", table_cell), Paragraph("Gateway fee for verifying payments automatically without screenshots.", table_cell)],
    ]
    ais_t = Table(aisensy_cost_data, colWidths=[120, 110, 274])
    ais_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(ais_t)

    story.append(Spacer(1, 6))
    story.append(create_box(
        "<b>Scenario 3 Verdict:</b> The best setup if you have a budget. Your Ops Dashboard works 100%, payments are automated, and you keep the mobile app on your phone. Costs around ₹2,000/month.",
        title="SCENARIO 3 RESULT: DASHBOARD IS 100% ACTIVE + PHONE APP WORKS",
        border_col=PRIMARY,
        bg=CARD_BG,
        pad=5
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 6: PART 5 - SCENARIO 4: DIRECT META CLOUD API (NO COEXISTENCE)
    # =========================================================================
    story.append(Paragraph("5. SCENARIO 4: DIRECT META CLOUD API (WITHOUT COEXISTENCE)", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=BORDER_COLOR, spaceAfter=8))

    story.append(Paragraph("5.1 How Direct Meta Cloud API Works", h2_style))
    story.append(Paragraph(
        "In this setup, you connect Meta's official WhatsApp Cloud API directly to your Hostinger server without using AiSensy. Your server catches the order, writes it to the database, and your <b>Ops Dashboard turns ON for ₹0 monthly fee</b>.",
        body_style
    ))
    story.append(Paragraph(
        "This sounds great because there are no monthly software fees. But it has one <b>huge, dangerous flaw</b>.",
        body_style
    ))

    story.append(Paragraph("5.2 The Danger: You LOSE WhatsApp on Your Phone", h2_style))
    story.append(Paragraph(
        "When a phone number is registered directly on Meta Cloud API without coexistence, <b>it is permanently removed from the WhatsApp app on your smartphone</b>.",
        body_style
    ))
    story.append(Paragraph(
        "The owner cannot open WhatsApp to check messages, reply to customers, or send photos of chocolate boxes. The phone app stops working on that number completely.",
        body_style
    ))

    story.append(Paragraph("5.3 Customer Support Fails: Dead Phone Calls & Ignored Messages", h2_style))
    story.append(Paragraph(
        "When there is no phone app active:",
        body_style
    ))
    story.append(Paragraph("• <b>Customer has a question:</b> Customer pays ₹2,000, then asks: <i>'Can you deliver this by 3 PM?'</i> The automated bot does not understand normal text. The message sits unread in server logs, and <b>no human ever sees it</b>.", bullet_style))
    story.append(Paragraph("• <b>Customer calls on WhatsApp:</b> Meta Cloud API does NOT support WhatsApp voice calls. <b>Calls do not ring on any phone.</b> The call drops immediately. The customer panics and thinks they were scammed.", bullet_style))

    story.append(Spacer(1, 4))
    scen4_eval = [
        [Paragraph("<b>Feature</b>", table_header), Paragraph("<b>What Happens in Scenario 4</b>", table_header), Paragraph("<b>Business Impact</b>", table_header)],
        [Paragraph("Monthly Software Fee", table_cell_bold), Paragraph("₹0 (Free, no AiSensy fee)", table_cell), Paragraph("Saves ₹2,000 every month.", table_cell)],
        [Paragraph("Ops Dashboard Sync", table_cell_bold), Paragraph("100% Active & Automated", table_cell), Paragraph("Orders go straight into your dashboard.", table_cell)],
        [Paragraph("WhatsApp on Phone", table_cell_bold), Paragraph("PERMANENTLY DISABLED", table_cell), Paragraph("Owner cannot use WhatsApp app on phone.", table_cell)],
        [Paragraph("Answering Questions", table_cell_bold), Paragraph("IMPOSSIBLE", table_cell), Paragraph("Customer questions are lost in server logs.", table_cell)],
        [Paragraph("WhatsApp Phone Calls", table_cell_bold), Paragraph("DO NOT RING", table_cell), Paragraph("Calls drop; customers get frustrated.", table_cell)],
    ]
    s4_t = Table(scen4_eval, colWidths=[110, 140, 254])
    s4_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(s4_t)

    story.append(Spacer(1, 6))
    story.append(create_box(
        "<b>Scenario 4 Verdict:</b> Although your Ops Dashboard works for free, losing the phone app makes customer communication impossible. Missed calls and ignored messages will ruin customer trust.",
        title="SCENARIO 4 RESULT: DASHBOARD WORKS, BUT YOU LOSE YOUR PHONE APP",
        border_col=DANGER,
        bg=colors.HexColor("#FFF8F8"),
        pad=5
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 7: PART 6 - SCENARIO 5: THE TWO-NUMBER HYBRID SYSTEM
    # =========================================================================
    story.append(Paragraph("6. SCENARIO 5: THE SMART 'TWO-NUMBER' HYBRID SETUP", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=BORDER_COLOR, spaceAfter=8))

    story.append(Paragraph("6.1 How the Two-Number System Solves the Problem for Free", h2_style))
    story.append(Paragraph(
        "If your client wants their <b>Ops Dashboard to work automatically</b>, wants <b>automated Razorpay payment links</b>, but <b>does not want to pay ₹2,000/month for AiSensy</b>, here is the smart solution: <b>The Two-Number System</b>.",
        body_style
    ))

    split_diag_data = [
        [Paragraph("<b>Line A: Automated Order Bot (Meta API)</b>", table_header), Paragraph("<b>Line B: Human Support Line (Real Phone)</b>", table_header)],
        [
            Paragraph("• Placed on the website checkout button.<br/>"
                      "• Receives orders & sends Razorpay links.<br/>"
                      "• <b>Turns your Ops Dashboard ON automatically!</b><br/>"
                      "• Runs 24/7 with zero monthly fees.", table_cell),
            Paragraph("• The owner's or manager's real smartphone.<br/>"
                      "• Normal WhatsApp Business app stays on phone.<br/>"
                      "• Customers can call on phone or WhatsApp anytime.<br/>"
                      "• Staff can chat, send voice notes, and help buyers.", table_cell)
        ]
    ]
    sp_t = Table(split_diag_data, colWidths=[252, 252])
    sp_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(sp_t)

    story.append(Paragraph("6.2 The Automatic Helper Message", h2_style))
    story.append(Paragraph(
        "If a customer texts Line A with a general question instead of an order, the server detects it and <b>instantly replies with a helpful guide message</b>:",
        body_style
    ))

    story.append(Spacer(1, 2))
    story.append(create_box(
        "<i>'Hello from Rare Cocoa! 🍫<br/>"
        "This is our automated line for fast order processing and tracking.<br/><br/>"
        "For custom orders, questions, or to speak directly with our team, please tap below to chat with our human support line:<br/>"
        "👉 <b>WhatsApp Support: +91 96761 14516 (wa.me/919676114516)</b><br/>"
        "📞 <b>Direct Phone Call: +91 96761 14516</b>'</i>",
        title="AUTOMATIC HELPER MESSAGE EXAMPLE",
        bg=LIGHT_BG,
        border_col=SECONDARY,
        pad=5
    ))
    story.append(Spacer(1, 4))

    story.append(Paragraph("6.3 Why This is the Best Zero-Fee Automation", h2_style))
    story.append(Paragraph(
        "• <b>Ops Dashboard is 100% Active:</b> Every order automatically lands in your database.<br/>"
        "• <b>Zero Monthly Tool Fees:</b> Saves ₹2,000 every month by not using third-party tools.<br/>"
        "• <b>Human Touch Protected:</b> Customers who need personal care talk to the owner directly on Line B.<br/>"
        "• <b>Minor Trade-Off:</b> Customer has to tap a link to switch to the human support chat.",
        body_style
    ))

    story.append(Spacer(1, 4))
    story.append(create_box(
        "<b>Scenario 5 Verdict:</b> The smartest zero-fee setup. Your Ops Dashboard turns ON automatically, payment links are automated, and you keep your personal customer phone line active.",
        title="SCENARIO 5 RESULT: DASHBOARD ACTIVE + ZERO MONTHLY FEES",
        border_col=SUCCESS,
        bg=colors.HexColor("#F4FAF6"),
        pad=5
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 8: PART 7 - MASTER COMPARISON TABLE
    # =========================================================================
    story.append(Paragraph("7. ALL 5 SCENARIOS COMPARED SIDE-BY-SIDE", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=BORDER_COLOR, spaceAfter=8))

    story.append(Paragraph(
        "Here is the master comparison table showing how all 5 options compare across every business factor:",
        body_style
    ))
    story.append(Spacer(1, 4))

    full_matrix_data = [
        [
            Paragraph("<b>Feature</b>", table_header),
            Paragraph("<b>Scenario 1<br/>Payment in Website</b>", table_header),
            Paragraph("<b>Scenario 2<br/>Current WhatsApp</b>", table_header),
            Paragraph("<b>Scenario 3<br/>AiSensy + Gateway</b>", table_header),
            Paragraph("<b>Scenario 4<br/>Direct Meta API</b>", table_header),
            Paragraph("<b>Scenario 5<br/>Two-Number Bot</b>", table_header)
        ],
        [
            Paragraph("<b>Where Customer Pays</b>", table_cell_bold),
            Paragraph("On website popup", table_cell),
            Paragraph("UPI QR in chat", table_cell),
            Paragraph("Payment link in chat", table_cell),
            Paragraph("Payment link in chat", table_cell),
            Paragraph("Payment link in chat", table_cell)
        ],
        [
            Paragraph("<b>Gateway Fee</b>", table_cell_bold),
            Paragraph("2.4% on all sales", table_cell),
            Paragraph("0.0% (Zero Fee)", table_cell),
            Paragraph("2.4% on all sales", table_cell),
            Paragraph("2.4% on all sales", table_cell),
            Paragraph("2.4% on all sales", table_cell)
        ],
        [
            Paragraph("<b>Monthly Software Fee</b>", table_cell_bold),
            Paragraph("₹0", table_cell),
            Paragraph("₹0", table_cell),
            Paragraph("₹1,500 - ₹2,500 / mo", table_cell),
            Paragraph("₹0", table_cell),
            Paragraph("₹0", table_cell)
        ],
        [
            Paragraph("<b>Ops Dashboard Status</b>", table_cell_bold),
            Paragraph("<b>WILL NOT WORK</b><br/>(Blind orders)", table_cell),
            Paragraph("<b>WILL NOT WORK</b><br/>(No API connected)", table_cell),
            Paragraph("<b>100% ACTIVE</b><br/>(Auto-updated)", table_cell),
            Paragraph("<b>100% ACTIVE</b><br/>(Auto-updated)", table_cell),
            Paragraph("<b>100% ACTIVE</b><br/>(Auto-updated)", table_cell)
        ],
        [
            Paragraph("<b>WhatsApp on Your Phone</b>", table_cell_bold),
            Paragraph("Not affected", table_cell),
            Paragraph("YES (Normal app)", table_cell),
            Paragraph("YES (Team app)", table_cell),
            Paragraph("<b>NO (Locked out)</b>", table_cell),
            Paragraph("YES (On Support Line)", table_cell)
        ],
        [
            Paragraph("<b>Customer Support Chat</b>", table_cell_bold),
            Paragraph("Disconnected", table_cell),
            Paragraph("Personal & Fast", table_cell),
            Paragraph("Personal & Fast", table_cell),
            Paragraph("Ignored / Lost", table_cell),
            Paragraph("Routed to Human", table_cell)
        ],
        [
            Paragraph("<b>WhatsApp Phone Calls</b>", table_cell_bold),
            Paragraph("No call support", table_cell),
            Paragraph("Rings on phone", table_cell),
            Paragraph("Rings on phone", table_cell),
            Paragraph("DOES NOT RING", table_cell),
            Paragraph("Rings on Line B", table_cell)
        ],
        [
            Paragraph("<b>Overall Decision</b>", table_cell_bold),
            Paragraph("<b>Dashboard fails</b>", table_cell),
            Paragraph("<b>Dashboard fails</b>", table_cell),
            Paragraph("<b>Best with budget</b>", table_cell),
            Paragraph("<b>Loses phone app</b>", table_cell),
            Paragraph("<b>Best for ₹0 fees</b>", table_cell)
        ]
    ]

    mat_table = Table(full_matrix_data, colWidths=[94, 82, 82, 82, 82, 82])
    mat_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('ALIGN', (1,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(mat_table)

    story.append(Spacer(1, 10))
    story.append(Paragraph("7.2 The 3 Big Takeaways from the Table", h2_style))
    story.append(Paragraph(
        "1. <b>Payment in Website (Scenario 1) DOES NOT solve the dashboard problem:</b> Money goes to Razorpay, but `ops.rarecocoa.com` receives nothing.<br/>"
        "2. <b>The Ops Dashboard only turns on if an API is connected (Scenarios 3, 4, 5):</b> Currently in Scenario 2, the dashboard will not work because no API is connected.<br/>"
        "3. <b>The two winning choices to activate your dashboard are Scenarios 3 and 5:</b> Scenario 3 if you want the mobile team app (costs ₹2,000/mo), or Scenario 5 if you want ₹0 monthly fees.",
        body_style
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 9: PART 8 - ACTION PLAN & FINAL RECOMMENDATION
    # =========================================================================
    story.append(Paragraph("8. RECOMMENDED ACTION PLAN FOR RARE COCOA", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=BORDER_COLOR, spaceAfter=8))

    story.append(Paragraph("8.1 Decision Rules for Rare Cocoa", h2_style))
    story.append(Paragraph(
        "Rare Cocoa should decide based on whether they are ready to turn the Ops Dashboard ON right now, and what their monthly budget is:",
        body_style
    ))

    story.append(Paragraph("• <b>If you want to keep costs at ₹0 and handle orders manually:</b> Keep Scenario 2 (Current WhatsApp). Understand that the Ops Dashboard will not work during this manual stage.", bullet_style))
    story.append(Paragraph("• <b>If you want the Ops Dashboard ON with zero monthly software fees:</b> Choose Scenario 5 (Two-Number System). Bot Line A feeds orders into your dashboard automatically, while Line B stays on the owner's phone for calls.", bullet_style))
    story.append(Paragraph("• <b>If you want the Ops Dashboard ON and want a mobile team app:</b> Choose Scenario 3 (AiSensy). Your dashboard updates automatically, payments are verified, and staff chat using the AiSensy phone app (~₹2,000/mo).", bullet_style))

    story.append(Paragraph("8.2 The 3 Practical Steps Forward", h2_style))

    story.append(Paragraph("<b>STEP 1: Do Not Put Razorpay on the Website Alone</b>", h2_style))
    story.append(Paragraph(
        "Adding Razorpay directly on the website will not make the Ops Dashboard work. It will leave the dashboard blank and cause non-refundable fees on canceled orders.",
        body_style
    ))

    story.append(Paragraph("<b>STEP 2: Choose How to Activate the Ops Dashboard</b>", h2_style))
    story.append(Paragraph(
        "Pick either <b>Scenario 3 (AiSensy)</b> if you have the budget for the team app, or <b>Scenario 5 (Two-Number Bot)</b> if you want zero monthly fees. This will officially connect your WhatsApp orders to `ops.rarecocoa.com`.",
        body_style
    ))

    story.append(Paragraph("<b>STEP 3: Automate Payment Links in WhatsApp</b>", h2_style))
    story.append(Paragraph(
        "Once your chosen API is connected, orders will automatically receive Razorpay payment links, and your Ops Dashboard will mark them as 'Paid' without anyone checking screenshots.",
        body_style
    ))

    story.append(Spacer(1, 8))
    story.append(create_box(
        "<b>FINAL SUMMARY FOR YOUR CLIENT:</b><br/>"
        "Tell your client: <i>'Adding a payment gateway directly on the website will NOT make our Ops Dashboard work. It leaves the dashboard completely blind to order details.<br/><br/>"
        "Right now, in our current manual WhatsApp setup, the Ops Dashboard will not work because no API is connected yet.<br/><br/>"
        "To make our Ops Dashboard actively track orders, we must connect an API to WhatsApp. We should choose either AiSensy (if we want the mobile team app for ₹2,000/month) or the Two-Number System (if we want zero monthly fees). Both options will turn our Ops Dashboard ON, automate payment links, and let us talk to our customers from our phones.'</i>",
        title="EXECUTIVE RECOMMENDATION FOR CLIENT",
        bg=CARD_BG,
        border_col=PRIMARY,
        pad=6
    ))

    story.append(Spacer(1, 14))
    story.append(Paragraph("<b>GUIDE CONCLUDED  •  RARE COCOA</b>", ParagraphStyle('End', fontName='Helvetica-Bold', fontSize=8, leading=10, textColor=TEXT_MUTED, alignment=1)))

    doc.build(story, canvasmaker=NumberedCanvas)
    return filename

if __name__ == "__main__":
    out_file = build_pdf()
    reader = PdfReader(out_file)
    print(f"SUCCESS: Generated {out_file} with exactly {len(reader.pages)} pages.")
