
export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 border-red-300";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "low":
      return "bg-green-100 text-green-800 border-green-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

export const getPriorityText = (priority: string) => {
  switch (priority) {
    case "high":
      return "紧急";
    case "medium":
      return "一般";
    case "low":
      return "宽松";
    default:
      return "未设置";
  }
};
