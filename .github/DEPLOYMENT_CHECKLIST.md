# GitHub Actions EC2 Deployment Setup Checklist

## Quick Setup (5 minutes)

### 1. EC2 Instance Configuration
- [ ] Launch Ubuntu 22.04 LTS EC2 instance
- [ ] Configure security group (SSH 22, HTTP 3000)
- [ ] Allocate/associate Elastic IP (recommended)
- [ ] Create EC2 key pair and save locally

### 2. Install on EC2
```bash
# SSH into instance and run:
sudo apt-get update && sudo apt-get upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
sudo mkdir -p /opt/healthgram
sudo chown $USER:$USER /opt/healthgram
```

### 3. GitHub Secrets
Add these in **Settings → Secrets and variables → Actions**:

```
AWS_ACCESS_KEY_ID = <your-aws-access-key>
AWS_SECRET_ACCESS_KEY = <your-aws-secret-key>
AWS_REGION = us-east-1
EC2_HOST = <ec2-public-ip-or-dns>
EC2_USER = ubuntu
EC2_SSH_KEY = <paste-entire-private-key-content>
APP_PORT = 3000
SLACK_WEBHOOK = <optional-for-notifications>
```

### 4. Deploy
Push to `main` branch or manually trigger workflow from Actions tab

---

## Configuration Files

### Primary Workflow: `.github/workflows/deploy.yml`
- ✅ Standard SSH-based deployment
- ✅ Automated backups
- ✅ Health checks
- ✅ Slack notifications
- ✅ Suitable for most use cases

### Alternative Workflow: `.github/workflows/deploy-advanced.yml`
- ✅ Uses AWS Systems Manager
- ✅ No direct SSH credentials needed
- ✅ Better for security-conscious teams
- ✅ Requires EC2 IAM role with SSM permissions

---

## Monitoring Checklist

After deployment, verify:
- [ ] Application running: `curl http://EC2_IP:3000`
- [ ] PM2 status: `pm2 status`
- [ ] Check logs: `pm2 logs healthgram`
- [ ] Database initialized: Check SQLite db.js
- [ ] No errors in GitHub Actions logs

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| SSH Connection Timeout | Check EC2 security group allows SSH from GitHub IPs |
| Permission Denied | Verify SSH key format and EC2_SSH_KEY secret value |
| App fails health check | SSH to EC2, run `pm2 logs healthgram` |
| Build fails | Check Node version, run `npm ci` locally first |

---

## Security Reminders

✅ Never commit SSH keys or secrets  
✅ Use IAM users with minimal permissions  
✅ Rotate keys regularly  
✅ Enable branch protection  
✅ Monitor EC2 activity  

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed guide.
