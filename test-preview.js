import chromium from 'chromium-cli';

async function testDocumentPreview() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('🚀 Navigating to Fleet portal...');
    await page.goto('http://localhost:5173/fleet/client/dashboard', { waitUntil: 'networkidle' });

    // Wait for page to load
    await page.waitForTimeout(2000);

    console.log('✅ Page loaded successfully');
    console.log('🔍 Screenshot before interaction:');
    await page.screenshot({ path: 'test-before.png' });

    // Check if we need to login first
    const loginButton = await page.$('button:has-text("Masuk ke Portal")');
    if (loginButton) {
      console.log('📝 Login page detected, logging in...');

      // Fill in admin credentials
      await page.fill('input[placeholder="nama@perusahaan.com"]', 'admin@sentrakir.com');
      await page.fill('input[placeholder="••••••••"]', 'password');

      // Click admin tab first
      const adminTab = await page.$('button:has-text("Administrator")');
      if (adminTab) await adminTab.click();

      await page.click('button:has-text("Masuk ke Portal")');
      await page.waitForNavigation();
      await page.waitForTimeout(2000);
    }

    console.log('✅ Logged in');

    // Navigate to vehicles tab
    console.log('📋 Navigating to vehicles...');
    await page.click('a:has-text("Armada Kendaraan")');
    await page.waitForTimeout(2000);

    // Look for a "Dokumen Diupload" button
    const docButton = await page.$('button:has-text("📄 Dokumen Diupload")');

    if (docButton) {
      console.log('🎯 Found "Dokumen Diupload" button, clicking...');
      await docButton.click();
      await page.waitForTimeout(1000);

      // Look for a "Lihat" button in the modal
      const viewButton = await page.$('button:has-text("👁️ Lihat")');

      if (viewButton) {
        console.log('👁️ Found "Lihat" button, clicking...');
        await viewButton.click();
        await page.waitForTimeout(1500);

        console.log('✅ Preview modal opened!');
        console.log('📸 Screenshot of preview modal:');
        await page.screenshot({ path: 'test-preview-modal.png' });

        // Check if preview content is visible
        const previewContent = await page.$('.fleet-modal');
        if (previewContent) {
          console.log('✅ Preview modal is rendered');
          const text = await page.textContent('.fleet-modal');
          console.log('📄 Modal content preview:', text.substring(0, 200));
        }
      } else {
        console.log('❌ "Lihat" button not found');
      }
    } else {
      console.log('⚠️  "Dokumen Diupload" button not found - may need to add a vehicle first');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

testDocumentPreview();
