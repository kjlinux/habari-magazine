import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

// Mock db functions
vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    getUserProfile: vi.fn(),
    updateUserProfile: vi.fn(),
    isProfileCompleted: vi.fn(),
  };
});

import { getUserProfile, updateUserProfile, isProfileCompleted } from "./db";

const mockedGetUserProfile = vi.mocked(getUserProfile);
const mockedUpdateUserProfile = vi.mocked(updateUserProfile);
const mockedIsProfileCompleted = vi.mocked(isProfileCompleted);

function createAuthContext(overrides?: Partial<User>): TrpcContext {
  const user: User = {
    id: 42,
    openId: "test-open-id",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    subscriptionTier: "free",
    stripeCustomerId: null,
    firstName: null,
    lastName: null,
    phone: null,
    jobFunction: null,
    organization: null,
    country: null,
    sector: null,
    profileCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("profile.get", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns user profile for authenticated user", async () => {
    const profileData = {
      id: 42,
      name: "Test User",
      email: "test@example.com",
      firstName: "Jean",
      lastName: "Dupont",
      phone: "+237 699 123 456",
      jobFunction: "Directeur Général",
      organization: "Banque Centrale",
      country: "Cameroun",
      sector: "Banque & Finance",
      profileCompleted: true,
      subscriptionTier: "free" as const,
      role: "user" as const,
      createdAt: new Date(),
    };

    mockedGetUserProfile.mockResolvedValue(profileData);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.profile.get();

    expect(result).toEqual(profileData);
    expect(mockedGetUserProfile).toHaveBeenCalledWith(42);
  });

  it("rejects unauthenticated access", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.profile.get()).rejects.toThrow();
  });
});

describe("profile.update", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates profile with valid data", async () => {
    mockedUpdateUserProfile.mockResolvedValue({ success: true });

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const input = {
      firstName: "Jean",
      lastName: "Dupont",
      email: "jean.dupont@example.com",
      phone: "+237 699 123 456",
      jobFunction: "Directeur Général",
      organization: "Banque Centrale du Cameroun",
      country: "Cameroun",
      sector: "Banque & Finance",
    };

    const result = await caller.profile.update(input);

    expect(result).toEqual({ success: true });
    expect(mockedUpdateUserProfile).toHaveBeenCalledWith(42, input);
  });

  it("rejects empty firstName", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.profile.update({
        firstName: "",
        lastName: "Dupont",
        email: "jean@example.com",
        phone: "+237 699 123 456",
        jobFunction: "Analyste",
        organization: "ONU",
      })
    ).rejects.toThrow();
  });

  it("rejects invalid email", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.profile.update({
        firstName: "Jean",
        lastName: "Dupont",
        email: "not-an-email",
        phone: "+237 699 123 456",
        jobFunction: "Analyste",
        organization: "ONU",
      })
    ).rejects.toThrow();
  });

  it("rejects short phone number", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.profile.update({
        firstName: "Jean",
        lastName: "Dupont",
        email: "jean@example.com",
        phone: "123",
        jobFunction: "Analyste",
        organization: "ONU",
      })
    ).rejects.toThrow();
  });

  it("allows optional country and sector", async () => {
    mockedUpdateUserProfile.mockResolvedValue({ success: true });

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const input = {
      firstName: "Marie",
      lastName: "Ngoumou",
      email: "marie@example.com",
      phone: "+237 677 000 000",
      jobFunction: "Consultante",
      organization: "Cabinet XYZ",
    };

    const result = await caller.profile.update(input);

    expect(result).toEqual({ success: true });
    expect(mockedUpdateUserProfile).toHaveBeenCalledWith(42, input);
  });

  it("rejects unauthenticated access", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.profile.update({
        firstName: "Jean",
        lastName: "Dupont",
        email: "jean@example.com",
        phone: "+237 699 123 456",
        jobFunction: "Analyste",
        organization: "ONU",
      })
    ).rejects.toThrow();
  });
});

describe("profile.isCompleted", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns completed true when profile is filled", async () => {
    mockedIsProfileCompleted.mockResolvedValue(true);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.profile.isCompleted();

    expect(result).toEqual({ completed: true });
    expect(mockedIsProfileCompleted).toHaveBeenCalledWith(42);
  });

  it("returns completed false when profile is not filled", async () => {
    mockedIsProfileCompleted.mockResolvedValue(false);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.profile.isCompleted();

    expect(result).toEqual({ completed: false });
  });

  it("rejects unauthenticated access", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.profile.isCompleted()).rejects.toThrow();
  });
});
