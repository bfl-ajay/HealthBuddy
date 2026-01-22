# AWS EC2 Deployment Guide

**⚠️ Important Update:** The application now uses **MongoDB Atlas** for cloud-based data storage. See [database/README_MONGODB.md](database/README_MONGODB.md) for database setup.

This guide explains how to set up GitHub Actions to automatically deploy the HealthGram application to an AWS EC2 instance.

## Prerequisites

1. **AWS Account** with EC2 instance running
2. **GitHub Repository** with this workflow file
3. **GitHub Secrets** configured
4. **EC2 Instance Setup** with required software
5. **MongoDB Atlas** account and cluster (for database)

## Step 1: EC2 Instance Setup

### 1.1 Launch EC2 Instance

```bash
# Recommended configuration:
# - AMI: Ubuntu 22.04 LTS
# - Instance Type: t3.medium or better
# - Security Group: Allow SSH (22) and HTTP (3000) from your IP
```

### 1.2 Install Required Software on EC2

```bash
#!/bin/bash
# SSH into your EC2 instance and run:

# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install serve (static file server)
sudo npm install -g serve

# Create application directory
sudo mkdir -p /opt/healthgram
sudo chown $USER:$USER /opt/healthgram

# Setup PM2 startup script (use whichever method works for your setup)
# Method 1: Using pm2 directly (if global installation successful)
pm2 startup
sudo env PATH=$PATH:/usr/local/bin:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER
pm2 save

# OR Method 2: Using npx (most reliable, no path issues)
# npx pm2 startup systemd -u $USER --hp /home/$USER
# npx pm2 save

# Verify installation
pm2 --version
serve --version
```

## Step 2: Generate SSH Key Pair

```bash
# On your local machine:
ssh-keygen -t rsa -b 4096 -f ec2-deploy-key -N ""

# Copy public key to EC2
cat ec2-deploy-key.pub

# On EC2, add to ~/.ssh/authorized_keys:
echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
```

## Step 3: Configure GitHub Secrets

Navigate to your GitHub repository **Settings → Secrets and variables → Actions** and add:

### Required Secrets:

| Secret Name | Description | Example |
|---|---|---|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key | `AKIA*****` |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key | `wJalrXUtnFEMI/K7MDENG*****` |
| `EC2_HOST` | EC2 public IP or DNS | `ec2-1-2-3-4.compute-1.amazonaws.com` |
| `EC2_USER` | EC2 SSH user | `ubuntu` (for Ubuntu AMI) |
| `EC2_SSH_KEY` | Private SSH key (complete PEM content) | (copy entire `ec2-deploy-key` file content) |

### Recommended Secrets:

| Secret Name | Description | Default |
|---|---|---|
| `AWS_REGION` | AWS region for credentials | `us-east-1` |
| `APP_PORT` | Application port | `3000` |

### Optional Secrets:

| Secret Name | Description |
|---|---|
| `SLACK_WEBHOOK` | Slack webhook for deployment notifications |

### How to Add SSH Key Secret:

```bash
# On your local machine:
cat ec2-deploy-key | xargs -0 -I {} echo '{}'
# Or simply open the file in a text editor and copy the entire content
```

Paste the **entire private key content** into the `EC2_SSH_KEY` secret (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`).

**Note**: If you don't set `AWS_REGION`, it defaults to `us-east-1`. Set it if you're using a different region.

## Step 4: AWS IAM Permissions

Create an IAM user for GitHub Actions with minimal permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances",
        "ec2:DescribeTags",
        "ec2:GetConsoleOutput"
      ],
      "Resource": "*"
    }
  ]
}
```

Note: The workflow primarily uses SSH directly, so EC2 permissions are minimal.

## Step 5: Test the Deployment

### Option 1: Push to Main Branch
```bash
git push origin main
```

### Option 2: Manual Trigger
1. Go to **Actions** tab in GitHub
2. Select **Deploy to AWS EC2** workflow
3. Click **Run workflow**
4. Choose environment (production/staging)

## Deployment Workflow Details

The workflow performs these steps:

1. **Checkout** - Clones the repository
2. **Setup Node.js** - Installs Node 18 with dependency caching
3. **Install Dependencies** - Runs `npm ci --legacy-peer-deps`
4. **Build** - Creates static web export using `npx expo export --platform web`
5. **Package** - Creates compressed deployment package with built files
6. **AWS Config** - Configures AWS credentials
7. **Deploy** - Uploads to EC2 and extracts static files
8. **Start Server** - Uses `serve` package to serve static files on port 3000
9. **Health Check** - Verifies application is running (30 attempts, 10s intervals)
10. **Notifications** - Sends Slack notification (if configured)
11. **Cleanup** - Removes sensitive files

## Monitoring Deployment

### Check Logs
```bash
# SSH into EC2
ssh -i ec2-deploy-key ubuntu@YOUR_EC2_IP

# View PM2 logs
pm2 logs healthgram

# View PM2 status
pm2 status
```

### Check Application
```bash
# SSH into EC2 and test
curl http://localhost:3000

# Check PM2 logs
pm2 logs healthgram

# Check if port is open
ss -tuln | grep 3000
```

## Rollback on Failure

Backups are automatically created during deployment:

```bash
# SSH into EC2
ssh -i ec2-deploy-key ubuntu@YOUR_EC2_IP

# List available backups
ls -la /opt/healthgram-backup/

# Restore backup
sudo cp -r /opt/healthgram-backup/TIMESTAMP/* /opt/healthgram/
sudo chown -R $USER:$USER /opt/healthgram

# Restart application
cd /opt/healthgram
pm2 restart healthgram
```

## Troubleshooting

### Issue: SSH Connection Failed
- **Solution**: Verify EC2 security group allows SSH (port 22) from GitHub Actions IP
- Check `EC2_HOST` and `EC2_USER` are correct
- Ensure SSH key is properly formatted in `EC2_SSH_KEY` secret

### Issue: Application Fails Health Check
- SSH into EC2 and check PM2 logs: `pm2 logs healthgram`
- Verify Node dependencies installed: `npm ci --production`
- Check port is open: `ss -tuln | grep 3000`

### Issue: GitHub Actions Timeout
- Increase timeout in workflow if slow network
- Check EC2 instance has enough CPU/Memory
- Monitor `npm ci` and build times

### Issue: Permission Denied on EC2
- Verify `ec2-deploy-key.pub` is in `~/.ssh/authorized_keys`
- Check file permissions: `chmod 600 ~/.ssh/authorized_keys`

### Issue: PM2 Startup - "No such file or directory"
- **Solution**: PM2 global path may differ. Try these alternatives:
  ```bash
  # Method 1: Find where PM2 is installed
  which pm2
  
  # Method 2: Use npx (most reliable)
  npx pm2 startup systemd -u $USER --hp /home/$USER
  
  # Method 3: Reinstall PM2 globally
  sudo npm install -g pm2
  pm2 startup
  sudo env PATH=$PATH:/usr/local/bin:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER
  pm2 save
  ```

### Issue: EC2 Startup Script Not Working
- Check if PM2 startup service is enabled:
  ```bash
  sudo systemctl status pm2-$USER
  ```
- Manually start PM2 service:
  ```bash
  sudo systemctl start pm2-$USER
  pm2 status
  ```

### Issue: Expo Build Command Errors
- **Cause**: `npm run web` doesn't support `--build-path`. Expo uses different commands.
- **Solution**: The workflow now uses `npx expo export --platform web --output-dir dist`
- **What it does**: Creates a static export of the web app ready for deployment
- **Local testing**:
  ```bash
  npx expo export --platform web --output-dir dist
  npx serve -s dist -l 3000
  # Open http://localhost:3000
  ```

### Issue: Netlify Deploy - npm ERESOLVE Error
- **Cause**: `expo-router@4.0.22` requires `expo-constants@~17.0.8` but project has `expo-constants@18.0.13`
- **Solution**: A `.npmrc` file has been added to the project root with `legacy-peer-deps=true`
- **What it does**: Tells npm to ignore peer dependency conflicts during installation
- **Netlify impact**: Netlify respects the `.npmrc` file and will use this setting automatically
- **Recommended next step**: Check for newer `expo-router` versions that support `expo-constants@18`:
  ```bash
  npm info expo-router@latest peerDependencies
  npm info expo-router@4.0.22 peerDependencies
  ```
- **To upgrade** (if compatible version found):
  ```bash
  npm install expo-router@X.Y.Z --save
  npm install
  git add package.json package-lock.json .npmrc
  git commit -m "Upgrade expo-router for expo-constants v18 compatibility"
  git push origin main
  ```

### Issue: npm ERESOLVE - Peer Dependency Conflicts
- **Cause**: `expo-router@4.0.0` requires `expo-constants@~17.0.8` but project has `expo-constants@^18.0.13`
- **Solution**: The workflow uses `npm ci --legacy-peer-deps` to resolve this conflict
- **Local Fix** (if needed):
  ```bash
  npm ci --legacy-peer-deps
  # or
  npm install --legacy-peer-deps
  ```
- **Alternative**: Update package.json to use compatible versions:
  ```json
  "expo-constants": "~17.0.8"
  ```

## Security Best Practices

1. ✅ Store SSH keys only in GitHub Secrets (never in code)
2. ✅ Use IAM user specific for GitHub Actions (not root AWS account)
3. ✅ Restrict EC2 security group to necessary ports
4. ✅ Regularly rotate AWS access keys
5. ✅ Enable branch protection rules before deployment
6. ✅ Use environment-specific secrets for staging/production
7. ✅ Monitor EC2 CloudWatch logs for suspicious activity

## Next Steps

1. Set up production and staging environments
2. Configure database backup strategy
3. Implement SSL/TLS with nginx reverse proxy
4. Set up CloudWatch monitoring and alerts
5. Configure custom domain with Route 53

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Expo Web Deployment](https://docs.expo.dev/build/setup/)
