// import { useSocket } from "@/lib/useSocket";
// import { NextRequest, NextResponse } from "next/server";

// export async function middleware(request: NextRequest) {
//     const url = new URL(request.url);
//     const roomId = url.pathname.split("/")[2];

//     if (url.pathname.startsWith("/room/")) {
//         const socket = useSocket();

//         return new Promise((resolve) => {
//             socket.emit("checkRoom", roomId);

//             socket.on("roomExists", (exists: boolean) => {
//                 if (exists) {
//                     resolve(NextResponse.next());
//                 } else {
//                     resolve(NextResponse.redirect(new URL("/", request.url)));
//                 }
//                 socket.close();
//             });

//             socket.on("connect_error", () => {
//                 resolve(NextResponse.redirect(new URL("/", request.url)));
//                 socket.close();
//             });
//         });
//     }

//     return NextResponse.next();
// }