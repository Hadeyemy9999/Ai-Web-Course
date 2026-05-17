# How to Deploy Your Website to Vercel

Now that your website's code is safely stored on GitHub, it's time to put it live on the internet! We will use **Vercel**, one of the fastest and easiest hosting platforms for modern web applications.

## Prerequisites
1. You must have completed the **GitHub push** step (your code must be in a GitHub repository).
2. A **Vercel account**. If you don't have one, sign up at [vercel.com](https://vercel.com/) (You can sign up using your GitHub account!).

---

## Step 1: Connect Vercel to GitHub

1. Log in to your Vercel dashboard at [vercel.com/dashboard](https://vercel.com/dashboard).
2. Click the black **"Add New..."** button in the top right corner and select **"Project"**.
3. Under the "Import Git Repository" section, you will see a list of your GitHub repositories.
   *(If you don't see your repositories, click "Adjust GitHub App Permissions" and give Vercel access to your repositories).*
4. Find the repository you just created (e.g., `Ai-Web-Course`) and click the **Import** button next to it.

---

## Step 2: Configure and Deploy

After clicking Import, Vercel will take you to a "Configure Project" screen.

1. **Project Name:** You can leave this as the default (it usually copies your GitHub repo name).
2. **Framework Preset:** Vercel is smart! It will automatically detect that you are using plain HTML/CSS/JS and set this to **"Other"**. Leave it exactly as it is.
3. **Root Directory:** Leave this as `./`
4. **Environment Variables:** Since all of our Supabase and Paystack keys are already safely configured in our `index.html` file, you can leave this blank for now! *(Note: For advanced backend apps, this is where you would hide your secret keys).*
5. Click the big blue **Deploy** button.

---

## Step 3: Wait for the Magic

Vercel will now take over. You will see a screen showing the progress of your deployment.
- It is downloading your code from GitHub.
- It is building the environment.
- It is assigning you a free, secure `HTTPS` domain name!

This usually takes less than 30 seconds. When it's done, you'll see a screen with falling confetti! 🎉

---

## Step 4: Visit Your Live Website

1. Click the **Continue to Dashboard** button.
2. In the top right corner of your project dashboard, click the **Visit** button.
3. **Congratulations!** Your AI Web Course is now fully live on the internet. You can share this link with anyone in the world.

### Auto-Deployments (The Best Part!)
Because Vercel is connected directly to your GitHub, **you never have to do this process again.** 
Whenever you make a change to your code in VS Code and type `git push origin main`, Vercel will instantly detect the change and automatically update your live website within seconds!
