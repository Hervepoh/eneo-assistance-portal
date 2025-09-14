import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { SessionService } from "./session.service";
import { HTTPSTATUS } from "../../config/http.config";
import { NotFoundException } from "../../common/utils/catch-errors";
import { z } from "zod";

export class SessionController {
  private readonly sessionService: SessionService;

  constructor(sessionService: SessionService) {
    this.sessionService = sessionService;
  }

  // Liste toutes les sessions
  public getAllSession = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new NotFoundException("User not found in request");
    
    const { sessions } = await this.sessionService.getAllSession(userId);

    const modifySessions = sessions.map((session) => ({
      ...session.get(), // plain object Sequelize
      isCurrent: session.id === Number(req.sessionId),
    }));

    return res.status(HTTPSTATUS.OK).json({
      message: "Retrieved all sessions successfully",
      sessions: modifySessions,
    });
  });

  // Récupère une session par ID
  public getSession = asyncHandler(async (req: Request, res: Response) => {
    const sessionId = Number(req.sessionId);
    if (!sessionId) throw new NotFoundException("Session ID not found");

    const { user, session } = await this.sessionService.getSessionById(sessionId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Session retrieved successfully",
      user,
      session,
    });
  });

  // Supprime une session
  public deleteSession = asyncHandler(async (req: Request, res: Response) => {
    const sessionId = z.number().parse(Number(req.params.id));
    const userId = req.user?.id;
    if (!userId) throw new NotFoundException("User not found in request");

    await this.sessionService.deleteSession(sessionId, userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Session removed successfully",
    });
  });
}
