const capitalize = (data) => {
  if (data) return `${data?.charAt(0)?.toUpperCase()}${data?.slice(1)}`;
};

const capitalizeEachWord = (text) => {
  const destructuredStringArray = text.split(" ");
  const capitalizedString = [];

  for (let i = 0; i < destructuredStringArray.length; i++) {
    capitalizedString.push(capitalize(destructuredStringArray[i]));
  }

  return capitalizedString.join(" ");
};

module.exports = { capitalize, capitalizeEachWord };
