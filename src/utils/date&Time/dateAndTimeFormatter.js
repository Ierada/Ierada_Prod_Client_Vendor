import moment from "moment-timezone";

export const formatDate = (dateString) => {
  const localDate = moment(dateString).local();
  return localDate.format("DD MMMM YYYY");
};

export const formatTime = (dateString) => {
  const localDate = moment(dateString).local();
  return localDate.format("hh:mm A");
};

export const formatMonthYear = (dateString) => {
  const localDate = moment(dateString).local();
  return localDate.format("MMM YYYY");
};

export const formatDateForCalander = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatCurrency = (amount) => {
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "IND",
  });
  return formatter.format(amount);
};
