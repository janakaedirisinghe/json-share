/**
 * Sample JSON datasets for instant testing
 */

export const SAMPLES = [
  {
    id: 'user_profile',
    title: 'User Profile & Settings',
    description: 'Nested object with arrays, booleans, and nulls',
    data: {
      user: {
        id: "usr_99214a7e",
        username: "alex_dev",
        fullName: "Alex Rivera",
        email: "alex.rivera@example.dev",
        isVerified: true,
        role: "lead_architect",
        rating: 4.95,
        metadata: {
          signupDate: "2024-01-15T08:30:00Z",
          lastLogin: "2024-09-04T22:15:32Z",
          preferredTheme: "midnight-dark",
          notifications: {
            email: true,
            push: false,
            slack: true
          }
        },
        skills: ["TypeScript", "Vue 3", "Go", "GraphQL", "Docker"],
        organizations: [
          { id: "org_101", name: "Acme Corp", plan: "Enterprise", seats: 250 },
          { id: "org_204", name: "OpenSource Labs", plan: "Community", seats: null }
        ]
      }
    }
  },
  {
    id: 'ecommerce_orders',
    title: 'E-Commerce Order Feed',
    description: 'Array of orders ideal for Table View & CSV export',
    data: [
      {
        orderId: "ORD-78291",
        customer: "Sarah Jenkins",
        total: 249.99,
        currency: "USD",
        status: "shipped",
        itemsCount: 3,
        createdAt: "2024-09-03T14:22:00Z"
      },
      {
        orderId: "ORD-78292",
        customer: "Liam O'Connor",
        total: 89.50,
        currency: "USD",
        status: "delivered",
        itemsCount: 1,
        createdAt: "2024-09-03T16:05:12Z"
      },
      {
        orderId: "ORD-78293",
        customer: "Mei Lin",
        total: 1250.00,
        currency: "USD",
        status: "processing",
        itemsCount: 8,
        createdAt: "2024-09-04T09:12:45Z"
      },
      {
        orderId: "ORD-78294",
        customer: "Carlos Mendez",
        total: 45.00,
        currency: "USD",
        status: "cancelled",
        itemsCount: 1,
        createdAt: "2024-09-04T11:40:19Z"
      }
    ]
  },
  {
    id: 'cloud_infra',
    title: 'Cloud Cluster Config',
    description: 'Deeply nested infrastructure config',
    data: {
      cluster: "us-east-prod-01",
      region: "us-east-1",
      autoScale: true,
      nodes: {
        min: 3,
        max: 20,
        current: 8,
        instanceType: "c6i.2xlarge"
      },
      services: [
        {
          name: "api-gateway",
          version: "v2.4.1",
          replicas: 4,
          healthCheck: { path: "/healthz", intervalSeconds: 15, timeoutSeconds: 5 },
          env: {
            NODE_ENV: "production",
            LOG_LEVEL: "info",
            CACHE_TTL: 3600
          }
        },
        {
          name: "auth-service",
          version: "v1.9.0",
          replicas: 2,
          healthCheck: { path: "/status", intervalSeconds: 30, timeoutSeconds: 3 },
          env: {
            AUTH_PROVIDER: "oidc",
            SESSION_MAX_AGE: 86400
          }
        }
      ]
    }
  }
]
