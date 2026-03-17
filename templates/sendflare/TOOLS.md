# TOOLS.md - Sendflare Tools

_Local tool configurations for email management._

## Sendflare Configuration

### API Settings
```bash
SEND_FLARE_API_TOKEN="your-api-token-here"
SEND_FLARE_APP_ID="your-app-id-here"
SEND_FLARE_API_URL="https://api.sendflare.com"
```

### Installation

**此 Agent 已内置 sendflare-skill，无需单独安装！**

Skill 位置：
```
templates/sendflare/skills/sendflare-skill/
```

安装 Agent 后，skill 会自动部署到：
```bash
~/.agents/skills/sendflare-skill/
```

## Required Skills

| Skill | Purpose | Status |
|-------|---------|--------|
| `sendflare-skill` | Email sending & contacts | ✅ Built-in |

## Local Commands

### Send Email
```bash
# Send a simple email
sendflare send --to "test@example.com" --subject "Test" --body "Hello"

# Send with CC
sendflare send --to "test@example.com" --cc "cc@example.com" --subject "Test" --body "Hello"
```

### Manage Contacts
```bash
# List contacts
sendflare contacts list

# Add contact
sendflare contacts add --email "john@example.com" --name "John Doe"

# Delete contact
sendflare contacts delete --email "john@example.com"
```

## Environment Variables

```bash
# Add to ~/.openclaw/.env
SEND_FLARE_API_TOKEN="your-api-token"
SEND_FLARE_APP_ID="your-app-id"
SEND_FLARE_DEFAULT_FROM="noreply@yourdomain.com"
```

## Sending Log Location

```
~/.openclaw/workspace/agents/sendflare-agent/memory/email-log.md
```

## Rate Limits

- **Send Limit:** 100 emails/minute
- **Daily Limit:** Depends on Sendflare plan
- **Contact API:** 1000 requests/hour

## Troubleshooting

### Send Failed
- Check API token validity
- Verify sender domain is verified
- Check recipient email format
- Verify daily limit not exceeded

### Contact Management Failed
- Check AppId configuration
- Verify API token has contact permissions
- Check contact email format

---

_Keep your Sendflare credentials secure. Never commit API tokens to version control._
