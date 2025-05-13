// export function handleServerError(
//   error: unknown,
//   mode: "toast" | "alert" = "toast"
// ) {
//   if (error instanceof ApiError) {
//     if (mode === "toast") {
//       toast.error(error.name, {
//         description: error.message,
//       });
//     }
//   } else {
//     const errMsg = "Something went wrong!";
//     if (mode === "toast") {
//       toast.error(errMsg);
//     }
//   }
// }
