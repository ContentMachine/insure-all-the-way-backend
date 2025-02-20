const formatScrappedData = (data) => {
  const rows = data.split("\n").filter((row) => row.trim() !== "");

  const headers = rows[0]
    .split("\t")
    .map((header) => header.trim().replace(/\s+/g, "-").toLowerCase());

  const dataRows = rows.slice(1);

  const formattedData = dataRows.map((row) => {
    const values = row.split("\t");
    return headers.reduce((acc, header, index) => {
      acc[header] = values[index] ? values[index].trim() : null;
      return acc;
    }, {});
  });

  return formattedData;
};

module.exports = formatScrappedData;
