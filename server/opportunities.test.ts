import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createMockContext(role: "user" | "admin" = "user"): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role,
      subscriptionTier: "free" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createAnonymousContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Opportunities Router — Public", () => {
  it("should list bid opportunities", async () => {
    const ctx = createAnonymousContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.opportunities.list({ type: "bid" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should list ami opportunities", async () => {
    const ctx = createAnonymousContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.opportunities.list({ type: "ami" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should list job opportunities", async () => {
    const ctx = createAnonymousContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.opportunities.list({ type: "job" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should list all opportunities without type filter", async () => {
    const ctx = createAnonymousContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.opportunities.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get opportunity by slug (non-existent)", async () => {
    const ctx = createAnonymousContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.opportunities.bySlug({ slug: "non-existent-slug-xyz" });
    expect(result == null).toBe(true);
  });

  it("should get opportunity counts", async () => {
    const ctx = createAnonymousContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.opportunities.counts();
    expect(result).toBeDefined();
  });
});

describe("Opportunities Router — Admin CRUD", () => {
  const createdIds: number[] = [];

  it("should reject non-admin creating opportunity", async () => {
    const ctx = createMockContext("user");
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.admin.opportunities.create({
        type: "bid",
        title: "Test Bid",
        organization: "Test Org",
        country: "Cameroun",
        status: "active",
      })
    ).rejects.toThrow();
  });

  it("should reject anonymous creating opportunity", async () => {
    const ctx = createAnonymousContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.admin.opportunities.create({
        type: "bid",
        title: "Test Bid",
        organization: "Test Org",
        country: "Cameroun",
        status: "active",
      })
    ).rejects.toThrow();
  });

  it("should create a bid opportunity as admin", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.opportunities.create({
      type: "bid",
      title: "VITEST — Appel d'offres Construction",
      organization: "Ministère Test",
      country: "Cameroun",
      status: "active",
      sector: "Infrastructure",
      budget: "10M",
      currency: "USD",
      deadline: "30 juin 2026",
      description: "Description test",
      featured: false,
    });
    expect(result).toBeDefined();
    expect(result!.insertId).toBeDefined();
    createdIds.push(result!.insertId);
  });

  it("should create an AMI opportunity as admin", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.opportunities.create({
      type: "ami",
      title: "VITEST — AMI Partenariat",
      organization: "ONG Test",
      country: "Gabon",
      status: "active",
      amiType: "PPP",
      partners: "Partenaire A, Partenaire B",
    });
    expect(result).toBeDefined();
    expect(result!.insertId).toBeDefined();
    createdIds.push(result!.insertId);
  });

  it("should create a job opportunity as admin", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.opportunities.create({
      type: "job",
      title: "VITEST — Économiste Senior",
      organization: "BAD",
      country: "Côte d'Ivoire",
      status: "active",
      contractType: "CDI",
      experienceLevel: "Senior",
    });
    expect(result).toBeDefined();
    expect(result!.insertId).toBeDefined();
    createdIds.push(result!.insertId);
  });

  it("should list created bid opportunities", async () => {
    const ctx = createAnonymousContext();
    const caller = appRouter.createCaller(ctx);
    const bids = await caller.opportunities.list({ type: "bid" });
    expect(bids.length).toBeGreaterThanOrEqual(1);
    const found = bids.find((b) => b.title.includes("VITEST"));
    expect(found).toBeDefined();
  });

  it("should get created opportunity by id (admin)", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.opportunities.byId({ id: createdIds[0] });
    expect(result).not.toBeNull();
    expect(result!.title).toContain("VITEST");
    expect(result!.type).toBe("bid");
  });

  it("should update opportunity as admin", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.opportunities.update({
      id: createdIds[0],
      title: "VITEST — Appel d'offres Construction (modifié)",
      budget: "15M",
      featured: true,
    });
    expect(result).toBeDefined();
    expect(result!.success).toBe(true);
  });

  it("should verify updated fields", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.opportunities.byId({ id: createdIds[0] });
    expect(result).not.toBeNull();
    expect(result!.title).toContain("modifié");
    expect(result!.budget).toBe("15M");
    expect(result!.featured).toBe(true);
  });

  it("should reject non-admin updating opportunity", async () => {
    const ctx = createMockContext("user");
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.admin.opportunities.update({
        id: createdIds[0],
        title: "Hacked",
      })
    ).rejects.toThrow();
  });

  it("should toggle featured status", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.opportunities.toggleFeatured({ id: createdIds[0] });
    expect(result).toBeDefined();
  });

  it("should delete opportunities as admin", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);
    for (const id of createdIds) {
      const result = await caller.admin.opportunities.delete({ id });
      expect(result).toBeDefined();
      expect(result!.success).toBe(true);
    }
  });

  it("should reject non-admin deleting opportunity", async () => {
    const ctx = createMockContext("user");
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.admin.opportunities.delete({ id: 999999 })
    ).rejects.toThrow();
  });
});
