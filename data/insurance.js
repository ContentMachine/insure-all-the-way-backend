const insurances = [
  {
    id: "motor-insurance",
    price: "₦15,000 - ₦20,000",
    types: [
      {
        id: "third-party-motor-insurance",

        description:
          "With this insurance policy, you are covered for any damage or liability caused to a third party.",
        price: "₦15,000",
        features: [
          "Legal Liability Cover",
          "Third-Party Property Damage",
          "Third-Party injury of Death",
          "Affordable Premiums",
        ],
        plans: [
          {
            name: "Private",
            price: 15000,
            features: [
              "Third Party Property Damage of up to ₦3 Million",
              "Property Damage",
            ],
            description: "All private vehicles.",
          },
          {
            name: "Commercial",
            price: 20000,
            features: ["Third-Party Liability", "Property Damage"],
            description: "Own goods, Staff Bus, Special Types",
          },
          {
            name: "Motorcycle",
            price: 5000,
            features: [
              "Third Party Property Damage of up to ₦3 Million",
              "Property Damage",
            ],
            description: "Own motorcycles, Commercial Motorcycles",
          },
          {
            name: "Commercial Truck",
            price: 100000,
            features: [
              "Third Party Property Damage of up to ₦5 Million",
              "Property Damage",
            ],
            description: "Trucks, Special Types",
          },
        ],
      },
      {
        id: "enhanced-third-party-motor-insurance",
        price: "₦35,000-₦45,000",
        description:
          "Enhanced Third Party insurance offers three vehicle coverage options.",
        features: [
          "Third-Party Liability",
          "Passenger Liability",
          "Medical Expenses",
          "Personal Accident Cover",
        ],
        plans: [
          {
            name: "Type A",
            price: 35000,
            features: [
              "Third Party Property Damage of up to ₦3 Million",
              "Unlimited coverage",
              "Medical expenses to a limit of ₦50,000",
            ],
            description: " For private use only",
          },
          {
            name: "Type B",
            price: 40000,
            features: [
              "Third Party Property Damage of up to ₦1 Million",
              "Unlimited coverage",
              "Medical expenses to a limit of ₦50,000",
            ],
            description:
              "For privately used buses and pickups. It is designed for staff and student transport, not for public hire.",
          },
          {
            name: "Type C",
            price: 45000,
            features: [
              "Third Party Property Damage of up to ₦1 Million",
              "Unlimited coverage",
              "Medical expenses to a limit of ₦50,000",
            ],
            description:
              "For privately owned goods-carrying vehicles used exclusively for the insured’s business transportation.",
          },
        ],
      },
      {
        id: "comprehensive-motor-insurance",
        description:
          "Comprehensive Motor Insurance covers loss or damage from fire, theft, vandalism, accident, or collision.",
        features: [
          "Third-Party Liability",
          "Own Vehicle Damage",
          "Theft & Fire Cover ",
          "Vandalism & Malicious Acts",
        ],
        plans: null,
        price: "5% of Vehicle Value",
      },
      {
        id: "fleet-motor-insurance",
        description:
          "With our fleet insurance, you can cover your entire fleet of vehicles.",
        features: [
          "Third-Party & Comprehensive Options",
          "Multiple Vehicle Coverage",
          "Cost-Effective ",
          "Customisable Coverage",
        ],
        plans: null,
        price: null,
      },
    ],
  },
  {
    id: "health-insurance",
    description: null,
    features: null,
    price: null,
    types: [
      {
        id: "individual-and-family-hmo",
        price: null,
        plans: null,
      },
      {
        id: "corporate-and-group-hmo",
        price: null,
        plans: null,
      },
    ],
  },
  {
    id: "property-insurance",
    description: null,
    features: null,
    price: null,
    types: [
      {
        id: "building",
        price: null,
        plans: null,
      },
      {
        id: "all-risk",
        price: null,
        plans: null,
      },
    ],
  },
];

module.exports = { insurances };
