const formatPrice = (price: number) => {
  return price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: "currency",
    currency: "USD",
  });
};

const formatTime = (time: number) => {
  return new Date(time).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const formatAndParsePrice = (price: string) => {
  return parseFloat(price);
};

export { formatPrice, formatTime, formatAndParsePrice };
