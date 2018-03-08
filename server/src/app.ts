import { createServer, Server } from "http";
import * as express from "express";
import * as path from "path";
import * as socketIo from "socket.io";

export class AppServer {
  public static readonly PORT: number = 4300;
  public static readonly BASE: string = "/../../build";
  private app: express.Application;
  private io: SocketIO.Server;
  private port: string | number;
  private server: Server;

  constructor() {
    this.createApp();
    this.config();
    this.createServer();
    this.routes();
    this.listen();
    this.sockets();
  }

  private createApp(): void {
    this.app = express();
  }

  private config(): void {
    this.port = process.env.PORT || AppServer.PORT;
  }

  private createServer(): void {
    this.server = createServer(this.app);
  }

  private routes(): void {
    const router = express.Router();
    router.get("/", (req, res, next) => {
      res.sendFile(path.join(__dirname + AppServer.BASE + "/index.html"));
    });
    this.app.use("/", express.static(path.join(__dirname, AppServer.BASE)));
  }

  private listen(): void {
    this.server.listen(this.port, () => {
      console.log("Running server on port %s", this.port);
    });
  }

  private sockets(): void {
    const _appServer = this;

    this.io = socketIo(this.server);

    this.io.on("connect", (socket: any) => {
      console.log("User connected on port %s.", this.port);
      socket.on("SEND_MESSAGE", (data: any) => {
        console.log("server: %s", JSON.stringify(data));
        this.io.emit("RECEIVE_MESSAGE", data);
      });
      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}
