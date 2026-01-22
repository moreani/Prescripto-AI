import sharp from 'sharp';

/**
 * Advanced prescription image preprocessing for maximum OCR accuracy
 * 
 * Techniques used:
 * 1. Blue channel extraction - Makes blue ink appear darker
 * 2. Adaptive contrast - Better handling of shadows
 * 3. Sharpening - Crisp up text edges
 * 4. Gamma correction - Darken faint midtones
 */
export async function preprocessPrescriptionImage(
    imageBuffer: Buffer,
    mimeType: string
): Promise<{ buffer: Buffer; base64: string; mimeType: string }> {
    try {
        const outputMimeType = 'image/png'; // Always output PNG for best quality

        let processor = sharp(imageBuffer);

        // Get image metadata
        const metadata = await processor.metadata();

        if (!metadata.width || !metadata.height) {
            console.log('[Preprocess] Invalid image metadata, returning original');
            return {
                buffer: imageBuffer,
                base64: imageBuffer.toString('base64'),
                mimeType,
            };
        }

        console.log(`[Preprocess] Input: ${metadata.width}x${metadata.height}, ${metadata.format}`);

        // TECHNIQUE 1: Remove alpha and ensure sRGB color space
        processor = processor
            .removeAlpha()
            .toColourspace('srgb');

        // TECHNIQUE 2: Normalize and enhance contrast adaptively
        processor = processor
            .normalize() // Auto-level to use full dynamic range
            .linear(1.4, -20); // Increase contrast, darken slightly

        // TECHNIQUE 3: Convert to grayscale (helps OCR focus on text)
        processor = processor.grayscale();

        // TECHNIQUE 4: Aggressive sharpening for text edges
        processor = processor.sharpen({
            sigma: 2.0,      // Slightly larger radius
            m1: 1.5,         // Flat area sharpening
            m2: 3.0,         // Edge sharpening (higher = more aggressive)
        });

        // TECHNIQUE 5: Modulate brightness to darken midtones (faint text)
        // Note: sharp gamma requires values >= 1.0, so we use modulate instead
        processor = processor.modulate({ brightness: 0.9 }); // Slightly darken

        // TECHNIQUE 6: Median filter to reduce noise
        processor = processor.median(1);

        // Output as high-quality PNG
        const outputBuffer = await processor.png({
            compressionLevel: 6,
            adaptiveFiltering: true,
        }).toBuffer();

        console.log(`[Preprocess] Enhanced: ${imageBuffer.length} → ${outputBuffer.length} bytes (grayscale, sharpened)`);

        return {
            buffer: outputBuffer,
            base64: outputBuffer.toString('base64'),
            mimeType: outputMimeType,
        };
    } catch (error) {
        console.error('[Preprocess] Error processing image:', error);
        return {
            buffer: imageBuffer,
            base64: imageBuffer.toString('base64'),
            mimeType,
        };
    }
}

/**
 * Aggressive enhancement for very faint/poor quality images
 * Uses binarization for maximum contrast
 */
export async function aggressiveEnhance(
    imageBuffer: Buffer,
    mimeType: string
): Promise<{ buffer: Buffer; base64: string; mimeType: string }> {
    try {
        const outputMimeType = 'image/png';

        const outputBuffer = await sharp(imageBuffer)
            .removeAlpha()
            .normalize()
            .linear(1.8, -40)           // Very aggressive contrast
            .grayscale()
            .sharpen({
                sigma: 2.5,
                m1: 2.0,
                m2: 4.0,
            })
            .modulate({ brightness: 0.8 }) // Even darker midtones
            .threshold(180)              // Binarize - pure black/white
            .png({ compressionLevel: 6 })
            .toBuffer();

        console.log(`[Preprocess] Aggressive enhance: ${imageBuffer.length} → ${outputBuffer.length} bytes`);

        return {
            buffer: outputBuffer,
            base64: outputBuffer.toString('base64'),
            mimeType: outputMimeType,
        };
    } catch (error) {
        console.error('[Preprocess] Aggressive enhance failed:', error);
        return {
            buffer: imageBuffer,
            base64: imageBuffer.toString('base64'),
            mimeType,
        };
    }
}

/**
 * Blue channel isolation - specifically for blue ink on white paper
 * Extracts and processes the red channel where blue ink appears darkest
 */
export async function blueInkEnhance(
    imageBuffer: Buffer
): Promise<{ buffer: Buffer; base64: string; mimeType: string }> {
    try {
        // Extract raw pixels
        const { data, info } = await sharp(imageBuffer)
            .removeAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        // Create new buffer using weighted channel extraction
        const grayscaleData = Buffer.alloc(info.width * info.height);

        for (let i = 0; i < info.width * info.height; i++) {
            // Red channel is at position i*3, Green at i*3+1, Blue at i*3+2
            const r = data[i * 3];
            const g = data[i * 3 + 1];
            const b = data[i * 3 + 2];

            // For blue ink: red channel shows blue ink as dark
            // Weighted average favoring red channel
            const pixel = Math.round(r * 0.6 + g * 0.3 + b * 0.1);
            grayscaleData[i] = pixel;
        }

        const outputBuffer = await sharp(grayscaleData, {
            raw: {
                width: info.width,
                height: info.height,
                channels: 1,
            }
        })
            .normalize()
            .linear(1.5, -30)
            .sharpen({ sigma: 2.0, m1: 1.5, m2: 3.0 })
            .png({ compressionLevel: 6 })
            .toBuffer();

        console.log(`[Preprocess] Blue ink enhance: ${imageBuffer.length} → ${outputBuffer.length} bytes`);

        return {
            buffer: outputBuffer,
            base64: outputBuffer.toString('base64'),
            mimeType: 'image/png',
        };
    } catch (error) {
        console.error('[Preprocess] Blue ink enhance failed:', error);
        return {
            buffer: imageBuffer,
            base64: imageBuffer.toString('base64'),
            mimeType: 'image/png',
        };
    }
}
