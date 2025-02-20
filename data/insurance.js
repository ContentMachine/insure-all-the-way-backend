const insurances = [
  {
    id: "motor-insurance",
    price: "₦15,000 - ₦20,000",
    types: [
      {
        id: "third-party-motor-insurance",

        description:
          "With this insurance policy, you are covered for any damage or liability caused to a third party",
        price: "₦35,000-₦45,000",
        features: [
          "Legal Liability Cover",
          "Third-Party Property Damage",
          "Third-Party injury of Death",
          "Affordable Premiums",
          "Coverage for Passengers",
        ],
        plans: [
          {
            name: "Private",
            price: 15000,
            features: ["All Vehicles", "It is just great"],
            description: "All vehicles, Own goods, Staff Bus",
          },
          {
            name: "Commercial",
            price: 20000,
            features: ["All Vehicles", "It is just great"],
            description: "Own goods, Staff Bus, Special Types",
          },
          {
            name: "Motorcycle",
            price: 5000,
            features: ["All motorcycles", "Commercial motorcycles"],
            description: "Own motorcycles, Commercial Motorcycles",
          },
          {
            name: "Commercial Truck",
            price: 100000,
            features: ["All Trucks", "It is just great"],
            description: "Trucks, Special Types",
          },
        ],
      },
      {
        id: "enhanced-third-party-motor-insurance",
        description:
          "Enhanced Third Party insurance offers three vehicle coverage options.",
        features: [
          "Third-Party Liability",
          "Passenger Liability",
          "Medical Expenses",
          "Towing & Roadside Assistance ",
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
              "for privately owned goods-carrying vehicles used exclusively for the insured’s business transportation.",
          },
        ],
      },
      {
        id: "comprehensive-motor-insurance",
        description:
          "Comprehensive Motor Insurance covers loss or damage from fire, theft, vandalism, accident, or collision",
        features: [
          "Third-Party Liability",
          "Own Vehicle Damage",
          "Theft & Fire Cover ",
          "Natural Disasters",
          "Vandalism & Malicious Acts",
        ],
        plans: null,
        price: "5% of Vehicle Value",
      },
      {
        id: "fleet-motor-insurance",
        description:
          "With our fleet insurance, you can cover your entire fleet of business vehicles.",
        features: [
          "Third-Party & Comprehensive Options",
          "Multiple Vehicle Coverage",
          "Cost-Effective ",
          "Employee Cover",
          "Customizable Coverage",
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
];

module.exports = { insurances };
