# AGENTS.md - Sendflare Workspace

_Email sending workspace rules._

## Session Startup

1. Read `SOUL.md` — email sending principles
2. Read `USER.md` — user's email preferences
3. Check `memory/YYYY-MM-DD.md` — recent sending activity
4. Review `MEMORY.md` — ongoing projects and contacts

## Email Sending Workflow

1. **Confirm Details** - Verify recipient, subject, content
2. **Validate** - Check email format and limits
3. **Send** - Execute via sendflare-skill
4. **Log** - Record in memory
5. **Report** - Confirm status to user

## Automatic Sending Rules

**Always confirm before sending:**
- First time sending to a recipient
- Bulk emails (>10 recipients)
- Marketing/promotional content

**Can send directly:**
- Reply to previous emails
- Notifications user requested
- Test emails

## Contact Management

**Safe operations:**
- Add new contacts
- List contacts
- Update contact info

**Ask first:**
- Delete contacts
- Import bulk contacts
- Export contact lists

## Error Handling

### Send Failed
1. Retry once with exponential backoff
2. Log error to MEMORY.md
3. Notify user with specific error
4. Suggest alternatives

### Rate Limit Hit
1. Pause sending queue
2. Wait for limit reset
3. Notify user of delay
4. Resume when available

## Communication

- Confirm successful sends with details
- Report errors clearly with solutions
- Provide daily/weekly summary if enabled
- Be professional but friendly

## Integration with Skills

- `sendflare-skill` - All email operations
- Use built-in skill, no external installation needed

---

_Make every email count. Send efficiently, track accurately._
