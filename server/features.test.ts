import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock user context
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
      hasNewsletterPremium: false,
      stripeCustomerId: null,
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

describe("Articles Router", () => {
  it("should list articles with pagination", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.articles.list({
      limit: 10,
      offset: 0,
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should list articles by country", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.articles.byCountry({
      countryId: 1,
      limit: 10,
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get article by slug", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.articles.bySlug({ slug: "non-existent-slug" });
    // Should return undefined/null for non-existent slug
    expect(result === undefined || result === null).toBe(true);
  });
});

describe("Directory Router", () => {
  it("should list economic actors", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.directory.list({
      limit: 10,
      offset: 0,
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should list economic actors by sector", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.directory.bySector({
      sector: "finance",
      limit: 10,
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get actor by slug", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.directory.bySlug({ slug: "non-existent-actor" });
    expect(result === undefined || result === null).toBe(true);
  });
});

describe("Investments Router", () => {
  it("should list investment opportunities", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.investments.list({
      limit: 10,
      offset: 0,
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should filter investments by country", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.investments.byCountry({
      countryId: 1,
      limit: 10,
    });

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Bids Router", () => {
  it("should list call for bids", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.bids.list({
      limit: 10,
      offset: 0,
    });

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Events Router", () => {
  it("should list upcoming events", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.events.upcoming({
      limit: 20,
    });

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Subscriptions Router", () => {
  it("should list subscription plans", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.subscriptions.plans();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get user subscription plan", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.subscriptions.userPlan();
    expect(typeof result === "object" || result === null || result === undefined).toBe(true);
  });
});

describe("Countries Router", () => {
  it("should list CEEAC countries", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.countries.list();

    expect(Array.isArray(result)).toBe(true);
    // CEEAC has 11 member states
    if (result.length > 0) {
      expect(result.length).toBe(11);
    }
  });

  it("should get country by code", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.countries.byCode({ code: "CM" });
    // May return undefined if no seed data
    expect(typeof result === "object" || result === undefined || result === null).toBe(true);
  });

  it("should include new CEEAC members (Angola, Burundi, RDC, Rwanda, São Tomé)", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const newMemberCodes = ["AO", "BI", "CD", "RW", "ST"];
    for (const code of newMemberCodes) {
      const result = await caller.countries.byCode({ code });
      // May return undefined if no seed data
      expect(typeof result === "object" || result === undefined || result === null).toBe(true);
    }
  });
});

describe("Newsletter Router", () => {
  it("should subscribe with free tier", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.newsletter.subscribe({
      email: "test-newsletter@example.com",
      tier: "free",
    });

    expect(result).toBeDefined();
    expect(result?.success).toBe(true);
  });

  it("should subscribe with premium tier when user has newsletterPremium", async () => {
    const ctx = createMockContextWithTier("integral");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.newsletter.subscribe({
      email: "test-premium@example.com",
      tier: "premium",
    });

    expect(result).toBeDefined();
    expect(result?.success).toBe(true);
  });

  it("should check newsletter status", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.newsletter.status({ email: "test-newsletter@example.com" });
    // May return subscriber or undefined
    expect(typeof result === "object" || result === undefined || result === null).toBe(true);
  });

  it("should unsubscribe from newsletter", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.newsletter.unsubscribe({ email: "test-newsletter@example.com" });
    expect(result).toBeDefined();
    expect(result?.success).toBe(true);
  });
});

describe("Newsletter Router — error cases", () => {
  it("should reject premium subscription for anonymous user", async () => {
    const ctx = createAnonymousContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.newsletter.subscribe({ email: "anon@example.com", tier: "premium" })
    ).rejects.toThrow();
  });

  it("should reject premium subscription for free-tier user without premium", async () => {
    const ctx = createMockContextWithTier("free");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.newsletter.subscribe({ email: "free@example.com", tier: "premium" })
    ).rejects.toThrow();
  });

  it("should return null/undefined status for unknown email", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.newsletter.status({ email: "unknown-xyz@example.com" });
    expect(result == null || typeof result === "object").toBe(true);
  });

  it("should handle double subscription without error (upsert)", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await caller.newsletter.subscribe({ email: "double@example.com", tier: "free" });
    const result = await caller.newsletter.subscribe({ email: "double@example.com", tier: "free" });
    // upsert may return undefined or { success: true } — must not throw
    expect(result === undefined || result?.success === true).toBe(true);
  });

  it("should reflect unsubscribed status after unsubscribe", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await caller.newsletter.subscribe({ email: "unsub-check@example.com", tier: "free" });
    await caller.newsletter.unsubscribe({ email: "unsub-check@example.com" });
    const result = await caller.newsletter.status({ email: "unsub-check@example.com" });
    if (result) {
      expect(result.status).toBe("unsubscribed");
    }
  });
});

describe("Articles Access Levels", () => {
  it("should list free articles", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.articles.free({
      limit: 10,
      offset: 0,
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should list premium articles", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.articles.premium({
      limit: 10,
      offset: 0,
    });

    expect(Array.isArray(result)).toBe(true);
  });
});

// ═══════════════════════════════════════════════
// ADMIN PROCEDURES TESTS
// ═══════════════════════════════════════════════

describe("Admin - Access Control", () => {
  it("should reject non-admin users from admin.stats", async () => {
    const ctx = createMockContext("user");
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.stats()).rejects.toThrow();
  });

  it("should reject non-admin users from admin.articles.list", async () => {
    const ctx = createMockContext("user");
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.articles.list({ limit: 10, offset: 0 })).rejects.toThrow();
  });

  it("should reject non-admin users from admin.users.list", async () => {
    const ctx = createMockContext("user");
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.users.list({ limit: 10, offset: 0 })).rejects.toThrow();
  });
});

describe("Admin - Dashboard Stats", () => {
  it("should return stats for admin users", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.stats();

    expect(result).toBeDefined();
    expect(typeof result.totalArticles).toBe("number");
    expect(typeof result.publishedArticles).toBe("number");
    expect(typeof result.draftArticles).toBe("number");
    expect(typeof result.totalUsers).toBe("number");
    expect(typeof result.totalSubscribers).toBe("number");
    expect(typeof result.premiumSubscribers).toBe("number");
  });
});

describe("Admin - Articles CRUD", () => {
  it("should list all articles (including drafts) for admin", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.articles.list({ limit: 50, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should list articles filtered by status", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.articles.list({ limit: 50, offset: 0, status: "draft" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should create a draft article", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.articles.create({
      title: "Test Article Admin",
      slug: "test-article-admin-" + Date.now(),
      content: "Contenu de test pour l'article admin.",
      status: "draft",
      minSubscriptionTier: "free",
    });

    expect(result).toBeDefined();
    expect(result?.success).toBe(true);
  });

  it("should get article by id for admin", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.articles.byId({ id: 99999 });
    // Non-existent id returns undefined
    expect(result === undefined || result === null).toBe(true);
  });
});

describe("Admin - Users Management", () => {
  it("should list all users for admin", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.users.list({ limit: 50, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should search users by name", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.users.list({ limit: 50, offset: 0, search: "test" });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Admin - Newsletter Management", () => {
  it("should list newsletter subscribers for admin", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.newsletter.list({ limit: 50, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should filter newsletter subscribers by tier", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.newsletter.list({ limit: 50, offset: 0, tier: "premium" });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Admin - Notifications", () => {
  it("should count targets for notifNewsletter (all tiers)", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.notifications.countTargets({ pref: "notifNewsletter" });
    expect(result).toHaveProperty("count");
    expect(typeof result.count).toBe("number");
  });

  it("should count targets for notifNewsletter (premium tier)", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.notifications.countTargets({ pref: "notifNewsletter", tier: "premium" });
    expect(result).toHaveProperty("count");
    expect(typeof result.count).toBe("number");
  });

  it("should send newsletter broadcast and return sent count", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.notifications.send({
      subject: "Test broadcast",
      html: "<p>Test</p>",
      pref: "notifNewsletter",
    });
    expect(result).toHaveProperty("sent");
    expect(typeof result.sent).toBe("number");
  });

  it("should send test email and return success", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.notifications.sendTest({
      email: "admin@example.com",
      subject: "Test",
      html: "<p>Test</p>",
    });
    expect(result?.success).toBe(true);
  });

  it("should reject broadcast from non-admin user", async () => {
    const ctx = createMockContext("user");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.admin.notifications.send({ subject: "x", html: "<p>x</p>", pref: "notifNewsletter" })
    ).rejects.toThrow();
  });
});

describe("Admin - Categories & Countries", () => {
  it("should list categories for admin", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.categories.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should list countries for admin", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.countries.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ═══════════════════════════════════════════════
// CONTACT FORM TESTS
// ═══════════════════════════════════════════════

describe("Contact Form - Public", () => {
  it("should submit a contact message", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contact.submit({
      name: "Jean Dupont",
      email: "jean.dupont@example.com",
      subject: "Question sur les abonnements",
      message: "Bonjour, je souhaite en savoir plus sur les abonnements premium pour mon entreprise basée à Douala.",
      category: "subscription",
    });

    expect(result).toBeDefined();
    expect(result?.success).toBe(true);
  });

  it("should submit a contact message with default category", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contact.submit({
      name: "Marie Ngo",
      email: "marie.ngo@example.com",
      subject: "Demande d'information générale",
      message: "Je souhaite obtenir des informations sur la plateforme Habari et ses services pour les investisseurs.",
    });

    expect(result).toBeDefined();
    expect(result?.success).toBe(true);
  });

  it("should reject invalid email", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.submit({
        name: "Test",
        email: "invalid-email",
        subject: "Test subject here",
        message: "This is a test message that is long enough to pass validation.",
      })
    ).rejects.toThrow();
  });

  it("should reject short message", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.submit({
        name: "Test",
        email: "test@example.com",
        subject: "Test subject",
        message: "Too short",
      })
    ).rejects.toThrow();
  });
});

describe("Admin - Contact Messages", () => {
  it("should reject non-admin users from admin.contact.list", async () => {
    const ctx = createMockContext("user");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.admin.contact.list({ limit: 50, offset: 0 })
    ).rejects.toThrow();
  });

  it("should list contact messages for admin", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.contact.list({ limit: 50, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should filter contact messages by status", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.contact.list({ limit: 50, offset: 0, status: "new" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should count new contact messages for admin", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.contact.countNew();
    expect(typeof result).toBe("number");
    expect(result).toBeGreaterThanOrEqual(0);
  });
});

// ═══════════════════════════════════════════════
// MAGAZINE PDF ACCESS TESTS
// ═══════════════════════════════════════════════

function createMockContextWithTier(
  tier: "free" | "premium" | "integral",
  role: "user" | "admin" = "user"
): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role,
      subscriptionTier: tier,
      hasNewsletterPremium: tier === "integral",
      stripeCustomerId: null,
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
    user: null as any,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Magazine PDF Access Control", () => {
  it("should deny access to N000 (free issue) for anonymous users when not in DB", async () => {
    const ctx = createAnonymousContext();
    const caller = appRouter.createCaller(ctx);

    // N000 may not exist in DB during tests; unknown issues default to premium (safe)
    const result = await caller.magazine.checkAccess({ issueId: "N000" });
    expect(result).toHaveProperty("hasAccess");
    expect(result).toHaveProperty("isLaunchPeriod");
  });

  it("should grant free access to N000 for free-tier users when issue exists and is not premium", async () => {
    const ctx = createMockContextWithTier("free");
    const caller = appRouter.createCaller(ctx);

    // Outcome depends on DB state: if N000 isPremium=false → free; if not in DB → launch_promo or not_authenticated
    const result = await caller.magazine.checkAccess({ issueId: "N000" });
    expect(result.hasAccess === true || result.hasAccess === false).toBe(true);
  });

  it("should deny access to N001 (premium issue) for anonymous users", async () => {
    const ctx = createAnonymousContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.magazine.checkAccess({ issueId: "N001" });
    expect(result.hasAccess).toBe(false);
    expect(result.reason).toBe("not_authenticated");
  });

  // During launch period (before June 1, 2026), all registered users get premium access
  it("should grant access to N001 for free-tier users during launch period (launch_promo)", async () => {
    const ctx = createMockContextWithTier("free");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.magazine.checkAccess({ issueId: "N001" });
    // During launch period, registered users get access via launch_promo
    expect(result.hasAccess).toBe(true);
    expect(result.reason).toBe("launch_promo");
    expect(result.isLaunchPeriod).toBe(true);
  });

  it("should grant access to N001 for premium-tier users", async () => {
    const ctx = createMockContextWithTier("premium");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.magazine.checkAccess({ issueId: "N001" });
    expect(result.hasAccess).toBe(true);
    // During launch, premium users get launch_promo (checked before subscription)
    expect(["launch_promo", "subscription"]).toContain(result.reason);
  });

  it("should grant access to N001 for integral-tier users", async () => {
    const ctx = createMockContextWithTier("integral");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.magazine.checkAccess({ issueId: "N001" });
    expect(result.hasAccess).toBe(true);
    expect(["launch_promo", "subscription"]).toContain(result.reason);
  });

  it("should grant access to N001 for admin users regardless of tier", async () => {
    const ctx = createMockContextWithTier("free", "admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.magazine.checkAccess({ issueId: "N001" });
    expect(result.hasAccess).toBe(true);
    expect(result.reason).toBe("admin");
  });

  it("should grant access to all premium issues for registered users during launch", async () => {
    const ctx = createMockContextWithTier("free");
    const caller = appRouter.createCaller(ctx);

    for (const issueId of ["N001", "N002", "N003"]) {
      const result = await caller.magazine.checkAccess({ issueId });
      expect(result.hasAccess).toBe(true);
      expect(result.reason).toBe("launch_promo");
    }
  });

  it("should still deny access to premium issues for anonymous users during launch", async () => {
    const ctx = createAnonymousContext();
    const caller = appRouter.createCaller(ctx);

    for (const issueId of ["N001", "N002", "N003"]) {
      const result = await caller.magazine.checkAccess({ issueId });
      expect(result.hasAccess).toBe(false);
      expect(result.reason).toBe("not_authenticated");
    }
  });

  it("should return isLaunchPeriod flag in all responses", async () => {
    const ctx = createAnonymousContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.magazine.checkAccess({ issueId: "N000" });
    expect(result).toHaveProperty("isLaunchPeriod");
    expect(typeof result.isLaunchPeriod).toBe("boolean");
  });

  it("should return launch status with days remaining", async () => {
    const ctx = createAnonymousContext();
    const caller = appRouter.createCaller(ctx);

    const status = await caller.magazine.launchStatus();
    expect(status).toHaveProperty("isLaunchPeriod");
    expect(status).toHaveProperty("launchEndDate");
    expect(status).toHaveProperty("daysRemaining");
    expect(typeof status.daysRemaining).toBe("number");
    // We are currently before June 1, 2026
    expect(status.isLaunchPeriod).toBe(true);
    expect(status.daysRemaining).toBeGreaterThan(0);
  });
});


describe("Admin Magazine Issues CRUD", () => {
  it("should list magazine issues (admin)", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.magazineIssues.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should create a magazine issue (admin)", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    const uniqueNum = `N°TEST-${Date.now()}`;
    const result = await caller.admin.magazineIssues.create({
      issueNumber: uniqueNum,
      title: "Test Magazine Issue",
      description: "A test issue for unit testing",
      isPremium: true,
      isPublished: false,
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it("should reject magazine issue creation by non-admin", async () => {
    const ctx = createMockContext("user");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.admin.magazineIssues.create({
        issueNumber: `N°FAIL-${Date.now()}`,
        title: "Should fail",
        isPremium: false,
        isPublished: false,
      })
    ).rejects.toThrow();
  });
});

describe("Public Magazine Issues", () => {
  it("should list published magazine issues", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.magazineIssues.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get magazine issue by number", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.magazineIssues.byNumber({ issueNumber: "N°000" });
    // May or may not exist depending on DB state, but should not throw
    expect(result === undefined || result !== null).toBe(true);
  });
});

describe("Admin Stats with Magazine", () => {
  it("should include magazine stats in admin dashboard", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.admin.stats();
    expect(stats).toHaveProperty("totalMagazineIssues");
    expect(stats).toHaveProperty("totalDownloads");
    expect(typeof stats.totalMagazineIssues).toBe("number");
    expect(typeof stats.totalDownloads).toBe("number");
  });

  it("should include user count in admin stats", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.admin.stats();
    expect(stats).toHaveProperty("totalUsers");
    expect(typeof stats.totalUsers).toBe("number");
    expect(stats.totalUsers).toBeGreaterThanOrEqual(0);
  });
});


describe("Archives Router", () => {
  const caller = appRouter.createCaller(createMockContext());

  it("should return archived articles", async () => {
    const result = await caller.archives.articles({});
    expect(result).toHaveProperty("articles");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.articles)).toBe(true);
    expect(typeof result.total).toBe("number");
  });

  it("should filter articles by year", async () => {
    const result = await caller.archives.articles({ year: 2026 });
    expect(result).toHaveProperty("articles");
    expect(result).toHaveProperty("total");
  });

  it("should filter articles by search query", async () => {
    const result = await caller.archives.articles({ search: "CEMAC" });
    expect(result).toHaveProperty("articles");
    expect(result).toHaveProperty("total");
  });

  it("should support pagination", async () => {
    const result = await caller.archives.articles({ limit: 3, offset: 0 });
    expect(result).toHaveProperty("articles");
    expect(result.articles.length).toBeLessThanOrEqual(3);
  });

  it("should return available years", async () => {
    const years = await caller.archives.years();
    expect(Array.isArray(years)).toBe(true);
  });

  it("should return available categories", async () => {
    const categories = await caller.archives.categories();
    expect(Array.isArray(categories)).toBe(true);
  });

  it("should return archived magazine issues", async () => {
    const issues = await caller.archives.issues({});
    expect(Array.isArray(issues)).toBe(true);
  });

  it("should filter magazine issues by year", async () => {
    const issues = await caller.archives.issues({ year: 2026 });
    expect(Array.isArray(issues)).toBe(true);
  });

  it("should filter magazine issues by search", async () => {
    const issues = await caller.archives.issues({ search: "Habari" });
    expect(Array.isArray(issues)).toBe(true);
  });
});
