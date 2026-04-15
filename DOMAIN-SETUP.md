# Setting up de.mmabrok.com to point at the DE course website

The `CNAME` file has been added to the repository. Now you need to do **two things on your side** — one in cPanel and one in GitHub.

## Step 1 — Add a DNS CNAME record in cPanel

1. Open cPanel (the screen you showed).
2. Under **Domains**, click **Zone Editor** (if you don't see it, look for **Advanced DNS Zone Editor** or **DNS Manager** — different cPanel themes label it differently).
3. Find `mmabrok.com` in the list and click **Manage**.
4. Click **+ Add Record** → choose type **CNAME**.
5. Fill in:

    | Field  | Value                      |
    | ------ | -------------------------- |
    | Name   | `de`                       |
    | TTL    | `14400` (or leave default) |
    | Type   | `CNAME`                    |
    | Target | `minds-r-lab.github.io.`   |

    (Note the trailing dot on `minds-r-lab.github.io.` — some cPanel UIs add it automatically, some don't. Both forms work in practice.)

6. Click **Save**. DNS usually propagates in 5–30 minutes.

## Step 2 — Tell GitHub about the custom domain

1. Go to [github.com/Minds-R-Lab/DE_01/settings/pages](https://github.com/Minds-R-Lab/DE_01/settings/pages).
2. Under **Custom domain**, enter: `de.mmabrok.com`.
3. Click **Save**.
4. GitHub will run a DNS check. Once it passes (after DNS propagates), tick **Enforce HTTPS**.
   - This may take a few minutes — GitHub automatically provisions a Let's Encrypt certificate.

That's it. Your course is now live at **https://de.mmabrok.com**.

## How to verify it's working

After 30 minutes or so, open a terminal and run:

```bash
dig de.mmabrok.com +short
```

You should see `minds-r-lab.github.io.` followed by GitHub's IP addresses.

Or just visit <https://de.mmabrok.com> in your browser.

## Troubleshooting

- **"DNS check failed" in GitHub Pages settings** → DNS hasn't propagated yet. Wait 30 minutes and click **Check again**.
- **"Your site is published at minds-r-lab.github.io/DE_01/"** (old URL) → you haven't set the custom domain in GitHub Pages settings yet. Do Step 2.
- **HTTPS padlock shows as broken** → certificate is still provisioning. Wait 15 minutes, refresh.
- **Want to undo this** → delete the CNAME record in cPanel, remove the custom domain in GitHub Pages settings, and delete the `CNAME` file from the repo.
