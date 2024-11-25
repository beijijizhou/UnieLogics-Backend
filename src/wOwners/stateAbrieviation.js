const stateAbbreviations = {
    alabama: "AL",
    alaska: "AK",
    arizona: "AZ",
    arkansas: "AR",
    california: "CA",
    colorado: "CO",
    connecticut: "CT",
    delaware: "DE",
    florida: "FL",
    georgia: "GA",
    hawaii: "HI",
    idaho: "ID",
    illinois: "IL",
    indiana: "IN",
    iowa: "IA",
    kansas: "KS",
    kentucky: "KY",
    louisiana: "LA",
    maine: "ME",
    maryland: "MD",
    massachusetts: "MA",
    michigan: "MI",
    minnesota: "MN",
    mississippi: "MS",
    missouri: "MO",
    montana: "MT",
    nebraska: "NE",
    nevada: "NV",
    "new hampshire": "NH",
    "new jersey": "NJ",
    "new mexico": "NM",
    "new york": "NY",
    "north carolina": "NC",
    "north dakota": "ND",
    ohio: "OH",
    oklahoma: "OK",
    oregon: "OR",
    pennsylvania: "PA",
    "rhode island": "RI",
    "south carolina": "SC",
    "south dakota": "SD",
    tennessee: "TN",
    texas: "TX",
    utah: "UT",
    vermont: "VT",
    virginia: "VA",
    washington: "WA",
    "west virginia": "WV",
    wisconsin: "WI",
    wyoming: "WY",
};

function getStateAbbreviation(input) {

    const normalizedInput = input.trim().toLowerCase();

    // Attempt direct match
    const exactMatch = stateAbbreviations[normalizedInput];
    if (exactMatch) {
        return exactMatch;
    }

    // Check for partial match ignoring spaces in keys
    const stateMatch = Object.keys(stateAbbreviations).find((state) =>
        state.toLowerCase().replace(/\s+/g, "") === normalizedInput.replace(/\s+/g, "")
    );

    if (stateMatch) {
        return stateAbbreviations[stateMatch];
    }

    // Fallback to the first two letters (uppercase)
    return normalizedInput.slice(0, 2).toUpperCase();
}


module.exports = getStateAbbreviation;