// English dictionary. This file also defines the shape (`Translations`) that
// the Arabic dictionary is type-checked against, so the two can never drift.

const en = {
  nav: {
    home: "Course",
    curriculum: "Curriculum",
    instructor: "Instructor",
    dates: "Start dates",
    faq: "FAQ",
    register: "Enroll now",
    admin: "Registrations",
    terms: "Terms & refunds",
    privacy: "Privacy policy",
    language: "Language",
    switchLanguage: "Switch to Arabic",
    toggleMenu: "Open menu",
    closeMenu: "Close menu",
    menu: "Menu",
  },

  brand: {
    name: "Ufuq Academy",
    line: "Applied digital marketing training",
    logoAlt: "Ufuq Academy",
  },

  common: {
    enrollNow: "Enroll now",
    enrollShort: "Enroll",
    seatsLeft: "%COUNT% seats left",
    soldOut: "Full",
    joinWaitlist: "Join the waitlist",
    whatsapp: "WhatsApp",
    askOnWhatsapp: "Ask on WhatsApp",
    skipToContent: "Skip to content",
    sar: "SAR",
    perSeat: "per seat, VAT included",
    required: "Required",
    optional: "Optional",
    back: "Back",
    next: "Continue",
    copy: "Copy",
    copied: "Copied",
    close: "Close",
    backHome: "Back to the course page",
    weeks: "weeks",
    sessions: "live sessions",
    hours: "hours",
    loading: "Working\u2026",
  },

  home: {
    meta: {
      title: "Applied Digital Marketing Course | Ufuq Academy",
      description:
        "A six-week applied digital marketing course, live online in Arabic. 12 live sessions, practice on a real ad account, a final project and a certificate. Reserve your seat by bank transfer.",
    },
    hero: {
      eyebrow: "Live online \u00b7 taught in Arabic",
      title: "Learn digital marketing by running real campaigns",
      lead: "Six weeks, twelve live sessions, and one complete funnel you build and launch yourself \u2014 from audience research to paid ads, landing pages and reporting.",
      ctaPrimary: "Enroll now",
      ctaSecondary: "See the curriculum",
      imageAlt: "Two marketers reviewing a campaign plan in a bright office",
      trust: "1,200+ marketers trained",
      nextStart: "Next cohort",
      priceLabel: "Course fee",
    },
    marks: {
      live: "Live sessions, not recordings",
      practical: "Practice on a real ad account",
      certificate: "Certificate of completion",
      support: "Direct support on WhatsApp",
    },
    outcomes: {
      eyebrow: "What you leave with",
      title: "Four things you can show an employer or a client",
      lead: "Every deliverable is produced during the course and reviewed with the instructor.",
      items: {
        one: {
          title: "A complete marketing funnel",
          body: "Offer, landing page, ad set and follow-up messages \u2014 for your own product or a ready-made case.",
        },
        two: {
          title: "A live campaign with real data",
          body: "You launch on a shared training budget and read the numbers yourself: CPM, CTR, CPA and ROAS.",
        },
        three: {
          title: "A reporting dashboard",
          body: "A one-page report template you can hand to a manager or a client every week.",
        },
        four: {
          title: "A portfolio case study",
          body: "Your results written up the way hiring managers in the Gulf actually ask for them.",
        },
      },
    },
    curriculum: {
      eyebrow: "Curriculum",
      title: "Six weeks, ordered the way the work happens",
      lead: "Two live sessions each week, plus one applied assignment reviewed in the next session.",
      weekLabel: "Week %COUNT%",
      sessionsLabel: "2 sessions \u00b7 4 hours",
      items: {
        w1: {
          title: "Strategy and audience",
          body: "Positioning, offer design, audience research, and the metrics that decide whether a campaign works.",
          points: ["Offer and value", "Audience and competitors", "Funnel mapping"],
        },
        w2: {
          title: "Content that converts",
          body: "Writing hooks and ad copy in Arabic, short-form video structure, and a content calendar you can repeat.",
          points: ["Hooks and ad copy", "Short-form video", "Content calendar"],
        },
        w3: {
          title: "Meta ads, hands on",
          body: "Campaign structure, audiences, creative testing and budget rules inside a real ad account.",
          points: ["Campaign structure", "Creative testing", "Budget and bidding"],
        },
        w4: {
          title: "Google, search and intent",
          body: "Search campaigns, keyword intent, landing page match, and the technical SEO basics that matter.",
          points: ["Search campaigns", "Keyword intent", "Landing page match"],
        },
        w5: {
          title: "Landing pages and tracking",
          body: "Build a page that converts, then wire up events, UTMs and conversion tracking correctly.",
          points: ["Page structure", "Events and UTMs", "Conversion tracking"],
        },
        w6: {
          title: "Analytics and the client report",
          body: "Read the data, cut what loses, scale what works, and present it on a single clear page.",
          points: ["Dashboards", "Scaling decisions", "Final project review"],
        },
      },
    },
    instructor: {
      eyebrow: "Instructor",
      title: "Taught by someone who spends the budget every day",
      imageAlt: "Studio portrait of the instructor",
    },
    details: {
      eyebrow: "Course details",
      title: "Everything you need to decide",
      duration: "Duration",
      durationValue: "6 weeks \u00b7 12 live sessions \u00b7 24 hours",
      attendance: "Attendance",
      schedule: "Schedule",
      language: "Language",
      level: "Level",
      levelValue: "Beginner to intermediate \u2014 no prior experience required",
      recordings: "Recordings",
      recordingsValue: "Every session recorded, available for 6 months",
      certificate: "Certificate",
      certificateValue: "Certificate of completion after the final project",
      seats: "Seats",
      seatsValue: "40 seats per cohort so feedback stays individual",
    },
    cohorts: {
      eyebrow: "Start dates",
      title: "Pick the month that suits you",
      lead: "A new cohort starts every month. Once a cohort fills, registration closes and the next month opens.",
      statusOpen: "Seats available",
      statusFew: "Almost full",
      statusFull: "Full",
      seatsTaken: "%TAKEN% of %TOTAL% seats taken",
      select: "Choose this cohort",
      fullNote: "This cohort is closed. Join the waitlist and we will contact you when a seat opens.",
    },
    pricing: {
      eyebrow: "Enrollment",
      title: "One fee, everything included",
      priceNote: "Early-bird price until 30 September",
      was: "Regular price %PRICE% SAR",
      includes: [
        "12 live sessions with the instructor",
        "Session recordings for 6 months",
        "Templates, checklists and swipe files",
        "Assignment reviews and feedback",
        "Private cohort group for questions",
        "Certificate of completion",
      ],
      payment:
        "Payment is by bank transfer. Upload your receipt during registration and we verify it within one business day.",
      cta: "Enroll now",
      guarantee: "Full refund if you cancel more than 7 days before the start date.",
    },
    testimonials: {
      eyebrow: "Participants",
      title: "What previous cohorts said",
      items: {
        one: {
          quote:
            "I started out running a small store account on guesswork. By week four I was reading the numbers and switching off the ads that were quietly burning the budget.",
          name: "Sara Al-Qahtani",
          role: "E-commerce owner, Riyadh",
        },
        two: {
          quote:
            "The assignments are the course. Every week your own work gets reviewed in front of the group, and that is where the learning actually happened.",
          name: "Abdulrahman Al-Shehri",
          role: "Marketing specialist, Jeddah",
        },
        three: {
          quote:
            "I used the final project in three interviews and got two offers. It was the only piece of work anyone actually asked me about.",
          name: "Noura Al-Otaibi",
          role: "Performance marketer, Dammam",
        },
      },
    },
    faq: {
      eyebrow: "FAQ",
      title: "Questions people ask before enrolling",
      items: {
        one: {
          q: "Do I need marketing experience?",
          a: "No. Week one starts from strategy fundamentals. What you do need is a few hours each week for the applied assignments.",
        },
        two: {
          q: "How do I pay?",
          a: "By bank transfer to the academy account. You choose a cohort, fill in a short form, transfer the fee, then upload the receipt. No account to create, and we never collect card details.",
        },
        three: {
          q: "When is my seat confirmed?",
          a: "Your request is recorded immediately as 'under review'. The team verifies the transfer within one business day and contacts you on WhatsApp with the joining link and course instructions.",
        },
        four: {
          q: "What if I miss a session?",
          a: "Every session is recorded and published the same night, recordings stay available for six months, and you can ask questions in the cohort group.",
        },
        five: {
          q: "Do I need my own ad budget?",
          a: "No. Practical work runs on a shared training budget provided by the academy. If you have your own account, you are welcome to use it.",
        },
        six: {
          q: "Can I get a refund?",
          a: "Yes \u2014 a full refund if you cancel more than 7 days before the start, 50% up to 48 hours before. After the second session the fee is non-refundable.",
        },
      },
    },
    finalCta: {
      title: "The next cohort starts %DATE%",
      lead: "Forty seats per cohort. Registration takes two minutes and nothing is charged online.",
      cta: "Enroll now",
      secondary: "Ask on WhatsApp",
    },
  },

  register: {
    meta: {
      title: "Registration \u2014 Applied Digital Marketing Course | Ufuq Academy",
      description:
        "Choose a cohort, enter your details, transfer the fee and upload the receipt. No account needed.",
    },
    title: "Course registration",
    lead: "Four short steps. No account required.",
    stepLabel: "Step %CURRENT% of %TOTAL%",
    steps: {
      cohort: "Cohort",
      details: "Your details",
      payment: "Payment",
      review: "Review",
    },
    summary: {
      title: "Your enrollment",
      course: "Course",
      courseName: "Applied Digital Marketing",
      cohort: "Cohort",
      starts: "Starts",
      schedule: "Schedule",
      attendance: "Attendance",
      total: "Total due",
      vat: "VAT included",
      notChosen: "Not selected yet",
    },
    cohort: {
      title: "Choose your start date",
      lead: "A cohort starts every month. Full cohorts are closed for registration.",
      error: "Please choose an available cohort to continue.",
    },
    details: {
      title: "Your details",
      lead: "We use these to send the joining link and course instructions. No account is created.",
      name: "Full name",
      namePlaceholder: "First and last name",
      phone: "Mobile number",
      phonePlaceholder: "5X XXX XXXX",
      phoneHint: "We confirm your seat on WhatsApp using this number.",
      email: "Email address",
      emailPlaceholder: "name@example.com",
      company: "Company or project",
      companyPlaceholder: "Optional",
      consent: "I agree to the terms, the refund policy and the privacy policy.",
      errors: {
        name: "Please enter your full name.",
        phone: "Enter a valid Saudi mobile number, for example 55 123 4567.",
        email: "Enter a valid email address.",
        consent: "Please accept the terms to continue.",
      },
    },
    payment: {
      title: "Transfer the course fee",
      lead: "Transfer the exact amount to the account below, then upload your receipt. No card payment required.",
      amount: "Amount to transfer",
      bank: "Bank",
      accountName: "Account name",
      iban: "IBAN",
      swift: "SWIFT",
      reference: "Transfer note",
      referenceValue: "Your full name",
      copyAll: "Copy transfer details",
      noticeTitle: "Before you upload",
      notice: [
        "Transfer the full amount in a single payment.",
        "Make sure the amount, date and last account digits are visible in the receipt.",
        "Bank transfer fees, if any, are paid by the sender.",
      ],
      upload: {
        title: "Upload your transfer receipt",
        lead: "A screenshot from your banking app is enough.",
        drop: "Drag the receipt here, or",
        browse: "choose a file",
        accepted: "PNG, JPG, WEBP or PDF \u00b7 up to 5 MB",
        demoTitle: "Demo build",
        demo: "This demo does not send files to any server. Use a sample receipt to walk through the full flow.",
        useSample: "Use a sample receipt",
        uploading: "Uploading\u2026",
        uploaded: "Receipt attached",
        replace: "Replace file",
        remove: "Remove",
        view: "View",
        errors: {
          type: "Unsupported file type. Use PNG, JPG, WEBP or PDF.",
          size: "That file is larger than 5 MB. Please upload a smaller one.",
          missing: "Please attach your transfer receipt to continue.",
        },
      },
    },
    review: {
      title: "Review and submit",
      lead: "Check your details before submitting. You can go back and edit any step.",
      edit: "Edit",
      participant: "Participant",
      proof: "Transfer receipt",
      submit: "Submit registration",
      submitting: "Submitting your request\u2026",
      notice:
        "Submitting sends your request for review. Your seat is confirmed once the team verifies the transfer.",
    },
    success: {
      badge: "Request received",
      title: "Thank you %NAME% \u2014 your request is under review",
      lead: "We have your details and your transfer receipt. The team will verify the payment and contact you on WhatsApp within one business day with the joining link and course instructions.",
      reference: "Reference number",
      status: "Status",
      statusValue: "Under review",
      keepReference: "Keep this number for any follow-up.",
      nextTitle: "What happens next",
      next: [
        "The team verifies the transfer against the amount and date.",
        "You receive a WhatsApp confirmation with the Zoom link and session schedule.",
        "A reminder is sent one day before the first session.",
      ],
      sendWhatsapp: "Send us the details on WhatsApp",
      calendar: "Add the start date to my calendar",
      copySummary: "Copy registration summary",
      contactNote: "Question while it is being reviewed? Message us on WhatsApp with your reference number.",
    },
  },

  admin: {
    meta: {
      title: "Registrations dashboard | Ufuq Academy",
      description:
        "Internal demo dashboard: registrations, payment status, data export and course settings.",
    },
    badge: "Internal demo dashboard",
    title: "Registrations",
    lead: "Operator view: review transfer receipts, update payment status, export the list, and edit course details.",
    stats: {
      total: "Total registrations",
      pending: "Awaiting review",
      verified: "Verified",
      revenue: "Collected",
    },
    filters: {
      search: "Search by name, email or reference",
      cohort: "All cohorts",
      status: "All statuses",
      export: "Export CSV",
      reset: "Reset demo data",
      resultCount: "%COUNT% results",
    },
    table: {
      reference: "Reference",
      participant: "Participant",
      cohort: "Cohort",
      amount: "Amount",
      status: "Payment status",
      submitted: "Submitted",
      proof: "Receipt",
      actions: "Actions",
      view: "View",
      verify: "Verify",
      reject: "Reject",
      contact: "WhatsApp",
      empty: "No registrations match these filters.",
    },
    status: {
      pending_review: "Under review",
      verified: "Verified",
      rejected: "Rejected",
    },
    proof: {
      title: "Transfer receipt",
      file: "File",
      openFull: "Open original",
      alt: "Uploaded bank transfer receipt",
    },
    settings: {
      title: "Course settings",
      lead: "Change the fee or close a cohort. The course page and the registration flow update immediately.",
      price: "Course fee (SAR)",
      cohortSeats: "Seats taken",
      cohortStatus: "Status",
      save: "Save changes",
      saved: "Saved",
    },
  },

  terms: {
    meta: {
      title: "Terms, cancellation & refunds | Ufuq Academy",
      description:
        "Registration terms, bank transfer payment, cancellation windows and the refund schedule for the Applied Digital Marketing course.",
    },
    title: "Terms, cancellation and refunds",
    lead: "These terms apply to every registration in the Applied Digital Marketing course.",
    updated: "Last updated: September 2026",
    sections: {
      enrollment: {
        title: "Enrollment and confirmation",
        body: [
          "A request is recorded when the form is submitted with a transfer receipt attached. At that point its status is 'under review', not confirmed.",
          "The seat is confirmed once the academy verifies the transfer, usually within one business day, and confirmation is sent on WhatsApp to the number provided.",
          "If the cohort fills before your transfer is verified, you may move to the next cohort or receive a full refund.",
        ],
      },
      payment: {
        title: "Payment",
        body: [
          "The fee is paid by bank transfer to the account shown in the registration flow. The academy does not collect card details.",
          "The displayed amount includes VAT. Bank transfer fees, if any, are paid by the sender.",
          "Receipts that do not match on amount, date or account are rejected, and the participant is contacted to resolve it.",
        ],
      },
      cancellation: {
        title: "Cancellation and refunds",
        body: [
          "More than 7 days before the start date: full refund.",
          "Between 7 days and 48 hours before the start: 50% refund.",
          "After the second live session: non-refundable.",
          "Refunds are returned to the originating bank account within 14 business days.",
        ],
      },
      changes: {
        title: "Changes by the academy",
        body: [
          "If a session is rescheduled, participants are notified at least 24 hours in advance and a recording is provided in all cases.",
          "If a cohort is cancelled by the academy, participants may move to another cohort or receive a full refund.",
        ],
      },
      conduct: {
        title: "Participation",
        body: [
          "Course materials and recordings are for personal use only and may not be redistributed or resold.",
          "Access may be suspended without refund if login details are shared or live sessions are disrupted.",
        ],
      },
    },
  },

  privacy: {
    meta: {
      title: "Privacy policy | Ufuq Academy",
      description:
        "What the registration form collects, why the transfer receipt is stored, how long data is kept, and how to request deletion.",
    },
    title: "Privacy policy",
    lead: "This policy covers the data collected by the registration form on this page.",
    updated: "Last updated: September 2026",
    sections: {
      collect: {
        title: "What we collect",
        body: [
          "Name, mobile number and email address, and optionally a company or project name.",
          "The cohort you chose and the transfer receipt you upload as proof of payment.",
          "Basic technical data such as the time the request was submitted.",
        ],
      },
      use: {
        title: "How we use it",
        body: [
          "To verify payment and confirm your seat.",
          "To send the joining link, session schedule and reminders.",
          "To issue the certificate of completion, and a tax invoice on request.",
        ],
      },
      sharing: {
        title: "Sharing",
        body: [
          "Data is never sold or used for third-party advertising.",
          "It is shared only with service providers required to run the course, such as the video meeting platform.",
        ],
      },
      retention: {
        title: "Retention",
        body: [
          "Transfer receipts are kept for the period required by accounting and tax regulations, then deleted.",
          "Contact details are kept during the course and for two years afterwards, unless you ask for deletion.",
        ],
      },
      rights: {
        title: "Your rights",
        body: [
          "You can request a copy, a correction or deletion of your data at any time on WhatsApp or by email.",
          "You can opt out of notification messages without affecting your registration.",
        ],
      },
      demo: {
        title: "About this demo build",
        body: [
          "This page is a demonstration build. Registrations and uploaded files are stored in your browser only and are never sent to a server.",
        ],
      },
    },
  },

  footer: {
    tagline:
      "Applied digital marketing training, taught live in Arabic to one small cohort each month.",
    linksTitle: "Course",
    policiesTitle: "Policies",
    contactTitle: "Contact",
    legalTitle: "Registration details",
    legalNameLabel: "Legal name",
    unifiedNumberLabel: "Unified number",
    crLabel: "Commercial registration",
    vatLabel: "VAT number",
    whatsappCta: "Ask on WhatsApp",
    paymentNote:
      "Bank transfer only. Registration is confirmed after the transfer is verified.",
    demoNote: "Demonstration build. Data stays in your browser.",
    rights: "\u00a9 %YEAR% Ufuq Academy. All rights reserved.",
    hours: "Response hours",
  },

  root: {
    notFound: {
      code: "404",
      title: "This page does not exist",
      lead: "The link may be out of date. Head back to the course page to finish registering.",
      home: "Back to the course page",
    },
    error: {
      title: "Something went wrong",
      lead: "Please try again. If it keeps happening, message us on WhatsApp and we will register you manually.",
      retry: "Try again",
      home: "Back to the course page",
    },
  },
};

export type Translations = typeof en;

export default en;
