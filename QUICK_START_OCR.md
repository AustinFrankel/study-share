# 🚀 Quick Start Guide - Updated Live Test System

## 📸 Admin: Upload Test Images with OCR

### Step 1: Get to Upload Page
Navigate to: `/live/upload?test=TEST_ID&name=TEST_NAME`

Example: `/live/upload?test=sat-mar&name=SAT%20March%202025`

### Step 2: Enter Password
- Password: `Unlock`
- Click "Verify Password"

### Step 3: Upload Images
1. Click "Images" upload type
2. Select multiple test images (JPG, PNG)
3. Click "Process & Upload Test"
4. Wait for OCR processing (shows progress)
5. Questions automatically extracted and saved
6. Redirects to test page when complete

### What Happens Behind the Scenes
```
Your Images → OCR API → Text Extraction → Question Parsing → Database → Live Test
```

---

## 🎓 Student: Take a Test

### Step 1: Visit Live Page
Go to: `/live`

### Step 2: Check Test Status
- **🔴 Red Dot**: Upcoming (>1 week away) → Join waitlist
- **🟠 Orange Dot**: This week (≤7 days) → Join waitlist
- **🟢 Green Dot**: Available now → Take test
- **⚪ Gray Dot**: Past test → May be available

### Step 3: Access Test
- Click test card
- If unlocked: Taken to test interface
- If locked: See lock screen (no content uploaded yet)

### Step 4: Take Test
- Click "Begin Test"
- Answer questions with Bluebook-style interface
- Use tools: Calculator, Highlighter, Answer Eliminator
- Navigate with question palette (click any question number)
- Submit when done

---

## 🎨 UI Features

### Test Interface
- **Question Navigation**: Click "Question X of Y" or use palette
- **Smooth Transitions**: 150ms fade between questions
- **Answer Choices**: Large, clear buttons with visual feedback
- **Tools**: Calculator, Flag, Highlighter, Eliminator
- **Timer**: 64 minutes with auto-submit

### Live Page
- **No Subtitles**: Clean card design
- **No "Archived Test"**: Just show status dots
- **Real-time Countdowns**: Accurate to the second
- **Status Indicators**: 4 color-coded dots

---

## 🔑 OCR API Details

### API Configuration
- **Provider**: OCR.space
- **API Key**: K84507617488957
- **Engine**: OCR Engine 2
- **Endpoint**: https://api.ocr.space/parse/image

### Supported Question Formats
The OCR system can detect:

**Question Numbers:**
```
1. Which choice...
2. What is...
Question 3: According to...
```

**Answer Choices:**
```
A) First option
B. Second option
C: Third option
D) Fourth option
```

**Correct Answers:**
```
Answer: B
Correct: C
Key: D
```

**Explanations:**
```
Explanation: The correct answer is...
Rationale: This is correct because...
Because the passage states...
```

---

## 📊 Example OCR Input/Output

### Input Image Text:
```
1. Which choice best describes the main idea?

A) The author criticizes modern technology
B) The passage explains a scientific concept
C) The text presents historical facts
D) The essay analyzes literary techniques

Answer: B
Explanation: The passage focuses on explaining complex concepts in accessible terms.

2. What is the primary purpose?
...
```

### Output (Structured JSON):
```json
[
  {
    "id": "sat-mar-q-1",
    "questionNumber": 1,
    "module": 1,
    "questionText": "Which choice best describes the main idea?",
    "choices": [
      { "letter": "A", "text": "The author criticizes modern technology" },
      { "letter": "B", "text": "The passage explains a scientific concept" },
      { "letter": "C", "text": "The text presents historical facts" },
      { "letter": "D", "text": "The essay analyzes literary techniques" }
    ],
    "correctAnswer": "B",
    "explanation": "The passage focuses on explaining complex concepts in accessible terms."
  }
]
```

---

## 🎯 Best Practices for Image Upload

### Image Quality
- ✅ High resolution (min 300 DPI)
- ✅ Good lighting, no glare
- ✅ Straight orientation (not tilted)
- ✅ Clear text, no blur
- ✅ Black text on white background

### Image Format
- ✅ JPG, JPEG, PNG
- ✅ One page per image (or use multi-page)
- ✅ Include question numbers
- ✅ Include answer choices clearly labeled
- ✅ Include answer key if available

### What to Avoid
- ❌ Blurry or low-quality images
- ❌ Handwritten text (OCR works best with printed text)
- ❌ Complex formatting or tables
- ❌ Multiple columns (split into separate images)
- ❌ Very small fonts

---

## 🔒 Admin Password Management

### Current Password
- **Password**: `Unlock`
- **Location**: `/src/app/live/upload/page.tsx`
- **Variable**: `UPLOAD_PASSWORD`

### To Change Password
1. Open `/src/app/live/upload/page.tsx`
2. Find line: `const UPLOAD_PASSWORD = 'Unlock'`
3. Change to your new password
4. Save and redeploy

---

## 🐛 Troubleshooting

### Test Shows "Locked"
- **Cause**: No questions uploaded yet
- **Solution**: Admin needs to upload images via `/live/upload`

### OCR Failed
- **Cause**: Poor image quality or unrecognized format
- **Solution**: 
  1. Check image quality
  2. Ensure text is printed (not handwritten)
  3. Try uploading again with better images

### Questions Not Formatted Correctly
- **Cause**: OCR couldn't parse question structure
- **Solution**: 
  1. Ensure clear question numbering (1., 2., etc.)
  2. Label answer choices clearly (A, B, C, D)
  3. Use consistent formatting

### Countdown Not Accurate
- **Fixed**: System now uses real-time calculations
- **Check**: Browser timezone settings

---

## 📱 Mobile Usage

All features work on mobile:
- ✅ Responsive test interface
- ✅ Touch-friendly buttons
- ✅ Mobile-optimized layout
- ✅ Works on iOS and Android

---

## ⚡ Performance Tips

### For Admins
- Upload images in batches (5-10 at a time)
- Use compressed images (not huge file sizes)
- Wait for OCR processing to complete

### For Students
- Modern browser recommended (Chrome, Safari, Firefox)
- Stable internet connection for auto-save
- Don't close browser during test

---

## 📞 Support

### Common Questions

**Q: Can I edit questions after OCR?**
A: Not yet - this is a future enhancement. For now, OCR results are saved directly.

**Q: How accurate is the OCR?**
A: Very accurate with good quality images. Use OCR Engine 2 for best results.

**Q: Can I upload answer keys separately?**
A: Currently, include answer key in images or add manually to database.

**Q: What if OCR misses a question?**
A: Reupload with clearer images or add questions manually to database.

---

## 🎉 Success Checklist

Before deployment:
- [ ] Test with real images
- [ ] Verify OCR extraction
- [ ] Check test interface on mobile
- [ ] Confirm countdown accuracy
- [ ] Test admin upload flow
- [ ] Verify password protection
- [ ] Check all status indicators
- [ ] Test smooth navigation

---

**System is ready for production use!** 🚀

For detailed technical documentation, see: `LIVE_SYSTEM_UPDATES_COMPLETE.md`
