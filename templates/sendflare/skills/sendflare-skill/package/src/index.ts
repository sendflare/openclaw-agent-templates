/**
 * Sendflare Skill
 * 
 * 通过 Sendflare SDK 发送电子邮件和管理联系人
 */
import { SendflareClient } from './sendflare-client';
import type { SendflareConfig, SkillContext, SkillResult, SendEmailRequest } from './types';

export class SendflareSkill {
  public name: string = 'sendflare-email';
  public description: string = '通过 Sendflare 发送电子邮件和管理联系人';
  public version: string = '1.0.2';

  private client: SendflareClient | null = null;
  private config: SendflareConfig | null = null;

  /**
   * 初始化方法（OpenClaw 会在加载时调用）
   */
  async initialize(config: SendflareConfig): Promise<void> {
    this.config = {
      apiToken: config.apiToken,
      appId: config.appId,
      fromEmail: config.fromEmail || 'noreply@yourdomain.com',
    };
    this.client = new SendflareClient(this.config);
  }

  /**
   * 核心执行方法
   */
  async execute(context: SkillContext): Promise<SkillResult> {
    try {
      if (!this.client && context.config) {
        await this.initialize(context.config);
      }

      if (!this.client || !this.config) {
        return {
          success: false,
          message: '技能未初始化，请配置 Sendflare API Token',
          suggestActions: ['配置 Sendflare API Token'],
        };
      }

      const { userMessage } = context;
      const message = userMessage.content;

      if (this.matchSendEmailIntent(message)) {
        return await this.handleSendEmail(message);
      } else if (this.matchGetContactsIntent(message)) {
        return await this.handleGetContacts(message);
      } else if (this.matchSaveContactIntent(message)) {
        return await this.handleSaveContact(message);
      } else if (this.matchDeleteContactIntent(message)) {
        return await this.handleDeleteContact(message);
      } else {
        return this.getHelpMessage();
      }
    } catch (error: any) {
      return {
        success: false,
        message: `执行失败：${error.message}`,
        error: error.stack,
      };
    }
  }

  private matchSendEmailIntent(message: string): boolean {
    const lowerMsg = message.toLowerCase();
    return (
      lowerMsg.includes('发送邮件') ||
      lowerMsg.includes('发邮件') ||
      lowerMsg.includes('send email') ||
      lowerMsg.includes('email to')
    );
  }

  private matchGetContactsIntent(message: string): boolean {
    const lowerMsg = message.toLowerCase();
    return (
      lowerMsg.includes('联系人列表') ||
      lowerMsg.includes('列出联系人') ||
      lowerMsg.includes('显示联系人') ||
      lowerMsg.includes('get contacts') ||
      lowerMsg.includes('list contacts')
    );
  }

  private matchSaveContactIntent(message: string): boolean {
    const lowerMsg = message.toLowerCase();
    return (
      lowerMsg.includes('保存联系人') ||
      lowerMsg.includes('添加联系人') ||
      lowerMsg.includes('save contact') ||
      lowerMsg.includes('add contact')
    );
  }

  private matchDeleteContactIntent(message: string): boolean {
    const lowerMsg = message.toLowerCase();
    return (
      lowerMsg.includes('删除联系人') ||
      lowerMsg.includes('remove contact') ||
      lowerMsg.includes('delete contact')
    );
  }

  private async handleSendEmail(message: string): Promise<SkillResult> {
    if (!this.client) {
      throw new Error('客户端未初始化');
    }

    let emailMatch = message.match(/发送邮件给 ([^\s,]+)，主题：([^,，]+)，内容：(.+)/);
    
    if (!emailMatch) {
      const simpleMatch = message.match(/发邮件 (?:到 | 给) ([^\s,]+)\s*(?:主题 | 标题)[:：]?\s*([^\s,]+)\s*(?:内容 | 正文)[:：]?\s*(.+)/);
      
      if (!simpleMatch) {
        return {
          success: false,
          message: '请指定收件人、主题和内容，例如：发送邮件给 test@example.com，主题：测试，内容：这是一封测试邮件',
          suggestActions: [
            '发送邮件给 test@example.com，主题：会议通知，内容：明天下午 3 点开会',
            '发邮件到 john@example.com 主题：问候 内容：你好！',
          ],
        };
      }

      const [, to, subject, body] = simpleMatch;
      return this.performSendEmail(to.trim(), subject.trim(), body.trim());
    }

    const [, to, subject, body] = emailMatch;
    return this.performSendEmail(to.trim(), subject.trim(), body.trim());
  }

  private async performSendEmail(to: string, subject: string, body: string): Promise<SkillResult> {
    if (!this.client || !this.config) {
      throw new Error('客户端未初始化');
    }

    const emailReq: SendEmailRequest = {
      from: this.config.fromEmail || 'noreply@yourdomain.com',
      to: to,
      subject: subject,
      body: body,
    };

    const result = await this.client.sendEmail(emailReq);

    if (result.success) {
      return {
        success: true,
        message: `✅ 邮件发送成功！\n收件人：${to}\n主题：${subject}\n发件人：${emailReq.from}`,
        data: result,
      };
    } else {
      return {
        success: false,
        message: `❌ 邮件发送失败：${result.message}`,
        error: result.message,
      };
    }
  }

  private async handleGetContacts(message: string): Promise<SkillResult> {
    if (!this.client || !this.config) {
      throw new Error('客户端未初始化');
    }

    if (!this.config.appId) {
      return {
        success: false,
        message: '请先配置 App ID 才能获取联系人列表',
        suggestActions: ['配置 App ID'],
      };
    }

    // 解析分页参数
    let page = 1;
    let pageSize = 20;

    const pageMatch = message.match(/第 (\d+) 页/);
    if (pageMatch) {
      page = parseInt(pageMatch[1], 10);
      if (page < 1) page = 1;
    }

    const pageSizeMatch = message.match(/每页 (\d+) 条/);
    if (pageSizeMatch) {
      pageSize = parseInt(pageSizeMatch[1], 10);
      if (pageSize < 1) pageSize = 1;
      if (pageSize > 100) pageSize = 100;
    }

    try {
      const result = await this.client.getContactList({
        appId: this.config.appId,
        page: page,
        pageSize: pageSize,
      });

      if (result.contacts && result.contacts.length > 0) {
        const totalPages = Math.ceil(result.total / result.pageSize);
        let contactList = `📋 联系人列表（共 ${result.total} 个，第 ${result.page}/${totalPages} 页）:\n\n`;
        result.contacts.forEach((contact, index) => {
          const name = contact.data?.firstName && contact.data?.lastName 
            ? `${contact.data.firstName} ${contact.data.lastName}` 
            : '未命名';
          contactList += `${index + 1}. ${name}\n   邮箱：${contact.emailAddress}\n`;
          if (contact.data?.company) contactList += `   公司：${contact.data.company}\n`;
          if (contact.data?.phone) contactList += `   电话：${contact.data.phone}\n`;
          contactList += '\n';
        });

        if (totalPages > 1) {
          contactList += `\n💡 提示：使用 "获取联系人列表 第 X 页" 或 "获取联系人列表 每页 X 条" 翻页`;
        }

        return {
          success: true,
          message: contactList,
          data: result,
        };
      } else {
        return {
          success: true,
          message: '联系人列表为空',
          data: result,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `获取联系人失败：${error.message}`,
        error: error.message,
      };
    }
  }

  private async handleSaveContact(message: string): Promise<SkillResult> {
    if (!this.client || !this.config) {
      throw new Error('客户端未初始化');
    }

    if (!this.config.appId) {
      return {
        success: false,
        message: '请先配置 App ID 才能保存联系人',
        suggestActions: ['配置 App ID'],
      };
    }

    const contactMatch = message.match(/保存联系人 ([^\s,]+)，姓名：(.+)/);
    
    if (!contactMatch) {
      const simpleMatch = message.match(/保存联系人 ([^\s,]+)/);
      if (simpleMatch) {
        const [, email] = simpleMatch;
        return this.performSaveContact(email, null);
      }
      
      return {
        success: false,
        message: '请指定联系人邮箱，例如：保存联系人 john@example.com，姓名：John Doe',
        suggestActions: ['保存联系人 john@example.com，姓名：John Doe'],
      };
    }

    const [, email, name] = contactMatch;
    return this.performSaveContact(email, name);
  }

  private async performSaveContact(email: string, name: string | null): Promise<SkillResult> {
    if (!this.client || !this.config || !this.config.appId) {
      throw new Error('客户端未初始化');
    }

    let firstName = '';
    let lastName = '';

    if (name) {
      const nameParts = name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }

    try {
      const result = await this.client.saveContact({
        appId: this.config.appId,
        emailAddress: email,
        data: {
          firstName,
          lastName,
        },
      });

      return {
        success: result.success,
        message: result.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `保存联系人失败：${error.message}`,
        error: error.message,
      };
    }
  }

  private async handleDeleteContact(message: string): Promise<SkillResult> {
    if (!this.client || !this.config) {
      throw new Error('客户端未初始化');
    }

    if (!this.config.appId) {
      return {
        success: false,
        message: '请先配置 App ID 才能删除联系人',
        suggestActions: ['配置 App ID'],
      };
    }

    const emailMatch = message.match(/删除联系人 ([^\s,]+)/);
    
    if (!emailMatch) {
      return {
        success: false,
        message: '请指定要删除的联系人邮箱，例如：删除联系人 john@example.com',
        suggestActions: ['删除联系人 john@example.com'],
      };
    }

    const [, email] = emailMatch;

    try {
      const result = await this.client.deleteContact({
        appId: this.config.appId,
        emailAddress: email,
      });

      return {
        success: result.success,
        message: result.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `删除联系人失败：${error.message}`,
        error: error.message,
      };
    }
  }

  private getHelpMessage(): SkillResult {
    return {
      success: true,
      message: `📧 Sendflare Skill 帮助

可用命令：
1. 发送邮件：发送邮件给 xxx@example.com，主题：xxx，内容：xxx
2. 获取联系人：
   - 获取联系人列表
   - 获取联系人列表 第 X 页
   - 获取联系人列表 每页 X 条
   - 获取联系人列表 第 X 页 每页 X 条
3. 保存联系人：保存联系人 xxx@example.com，姓名：xxx
4. 删除联系人：删除联系人 xxx@example.com

示例：
- 发送邮件给 test@example.com，主题：会议通知，内容：明天下午 3 点开会
- 获取联系人列表
- 获取联系人列表 第 2 页
- 获取联系人列表 每页 50 条
- 获取联系人列表 第 2 页 每页 50 条
- 保存联系人 john@example.com，姓名：John Doe
- 删除联系人 john@example.com

注意：需要在配置中设置 App ID 才能使用联系人功能`,
      suggestActions: [
        '发送邮件给 test@example.com，主题：测试，内容：这是一封测试邮件',
        '获取联系人列表',
        '获取联系人列表 第 2 页',
        '保存联系人 john@example.com，姓名：John Doe',
      ],
    };
  }
}

export default new SendflareSkill();
