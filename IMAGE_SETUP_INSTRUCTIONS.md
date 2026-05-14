# T.B. Lulla Portrait Image Setup Instructions

## Step 1: Save the Image
1. **Right-click** on the T.B. Lulla portrait image you shared
2. **Save the image** as `tb-lulla-portrait.jpg`
3. **Place it** in the `tb_client/public/images/` folder

## Step 2: Create the Images Folder (if it doesn't exist)
```bash
# Navigate to your client project
cd tb_client/public

# Create images folder if it doesn't exist
mkdir images

# Copy your saved image to this folder
# The final path should be: tb_client/public/images/tb-lulla-portrait.jpg
```

## Step 3: Verify the Setup
After placing the image, the file structure should look like:
```
tb_client/
├── public/
│   ├── images/
│   │   └── tb-lulla-portrait.jpg  ← Your T.B. Lulla portrait
│   └── ...
└── ...
```

## Step 4: Test the Image
1. **Start your client development server**:
   ```bash
   cd tb_client
   npm run dev
   ```

2. **Visit your website** and check the "Our Legacy" section
3. **The portrait should now appear** alongside the text about T.B. Lulla

## Alternative: Use Firebase Storage (Recommended)
If you want to use Firebase Storage instead:

1. **Upload the image** to Firebase Storage in the `foundation/` folder
2. **Get the download URL** from Firebase Console
3. **Replace the image src** in the component:
   ```typescript
   src="https://firebasestorage.googleapis.com/v0/b/admin-a6f7e.firebasestorage.app/o/foundation%2Ftb-lulla-portrait.jpg?alt=media"
   ```

## Image Details
- **File name**: `tb-lulla-portrait.jpg`
- **Recommended size**: 600x400 pixels (will be automatically resized)
- **Format**: JPG (for better compression)
- **Alt text**: "Shri T.B. Lulla - Founder of T.B. Lulla Charitable Foundation (1935-2010)"

## Fallback Behavior
If the image fails to load, the component will:
- Show a blue gradient background
- Display "Shri T.B. Lulla (1935-2010) Founder & Visionary" text
- Log an error message to the console

The image will appear in a beautiful layout alongside the foundation story text, creating a proper memorial section for the founder.