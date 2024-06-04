interface ApiResponseProps {
  statusCode: number;
  data: any; 
  message?: string;
}

const ApiResponse = ({ statusCode, data, message = "Success" }: ApiResponseProps) => {
  const response = {
    statusCode,
    data,
    message,
    success: statusCode < 400,
  };

  return response;
};

export default ApiResponse;
