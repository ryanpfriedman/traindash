import PptxGenJS from 'pptxgenjs';
import { Course } from '../types';

function hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
        : [99, 102, 241];
}

function rgbToHex(r: number, g: number, b: number): string {
    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

export async function exportPptx(course: Course): Promise<void> {
    const pptx = new PptxGenJS();
    const brand = course.brandSnapshot;
    const [pr, pg, pb] = hexToRgb(brand.primaryColor);
    const primaryHex = rgbToHex(pr, pg, pb);

    pptx.title = course.title;
    pptx.author = brand.companyName || 'TrainDash.io';
    pptx.company = brand.companyName || 'TrainDash.io';

    // Title slide
    const titleSlide = pptx.addSlide();
    titleSlide.background = { color: primaryHex };
    titleSlide.addText(course.title, {
        x: '5%', y: '30%', w: '90%', h: '20%',
        fontSize: 36, bold: true, color: 'FFFFFF',
        align: 'center', fontFace: 'Arial',
    });
    titleSlide.addText('Enterprise Training Course', {
        x: '5%', y: '52%', w: '90%', h: '8%',
        fontSize: 18, color: 'DDDDDD', align: 'center', fontFace: 'Arial',
    });
    titleSlide.addText(brand.companyName || 'TrainDash.io', {
        x: '5%', y: '75%', w: '90%', h: '8%',
        fontSize: 14, color: 'BBBBBB', align: 'center', fontFace: 'Arial',
    });

    for (const lesson of course.lessons) {
        // Chapter title slide
        const chapterSlide = pptx.addSlide();
        chapterSlide.background = { color: 'F8F9FA' };
        chapterSlide.addShape(pptx.ShapeType.rect, {
            x: 0, y: 0, w: '100%', h: '8%', fill: { color: primaryHex },
        });
        chapterSlide.addText(`Chapter ${lesson.order}: ${lesson.title}`, {
            x: '3%', y: '30%', w: '94%', h: '20%',
            fontSize: 28, bold: true, color: primaryHex, align: 'center', fontFace: 'Arial',
        });
        chapterSlide.addText(lesson.description, {
            x: '5%', y: '55%', w: '90%', h: '15%',
            fontSize: 14, color: '555555', align: 'center', fontFace: 'Arial',
        });

        let slideIndex = 0;
        // Content slides
        for (const slide of lesson.slides) {
            slideIndex++;
            const isEven = slideIndex % 2 === 0;
            const s = pptx.addSlide();
            s.background = { color: 'FFFFFF' };
            // Header bar
            s.addShape(pptx.ShapeType.rect, {
                x: 0, y: 0, w: '100%', h: '13%', fill: { color: primaryHex },
            });
            s.addText(slide.title, {
                x: '2%', y: '1%', w: '96%', h: '11%',
                fontSize: 20, bold: true, color: 'FFFFFF', fontFace: 'Arial', valign: 'middle',
            });

            // Draw a subtle accent line under the header for a premium feel
            s.addShape(pptx.ShapeType.rect, {
                x: 0, y: '13%', w: '100%', h: '0.5%', fill: { color: 'E2E8F0' },
            });

            // Layout Calculation
            const hasBullets = slide.bulletPoints && slide.bulletPoints.length > 0;
            const contentX = '5%';
            const contentW = hasBullets ? '45%' : '90%';

            // Main Content Paragraph
            if (slide.content) {
                s.addText(slide.content, {
                    x: contentX, y: '18%', w: contentW, h: '70%',
                    fontSize: 14, color: '333333', fontFace: 'Arial', valign: 'top',
                    breakLine: true, lineSpacing: 22
                });
            }

            // High-End Consulting Style "Feature Cards" for bullet points
            if (hasBullets) {
                const maxCards = Math.min(4, slide.bulletPoints!.length); // Limit to 4 cards to prevent messy overflow
                const availableHeight = 72; // total % height allocated for cards
                const spacing = 3; // % space between cards
                const cardHeight = (availableHeight - (spacing * (maxCards - 1))) / maxCards;

                for (let i = 0; i < maxCards; i++) {
                    const bp = slide.bulletPoints![i];
                    const cardY = 18 + (i * (cardHeight + spacing));

                    // Card background (light gray fill with subtle border)
                    s.addShape(pptx.ShapeType.roundRect, {
                        x: '53%', y: `${cardY}%`, w: '43%', h: `${cardHeight}%`,
                        fill: { color: 'F8FAFC' }, rectRadius: 0.1,
                        line: { color: 'E2E8F0', width: 1 }
                    });

                    // Thin colored accent bar on the left edge of each card
                    s.addShape(pptx.ShapeType.rect, {
                        x: '53%', y: `${cardY}%`, w: '1.2%', h: `${cardHeight}%`,
                        fill: { color: primaryHex }
                    });

                    // Text inside the feature card
                    s.addText(bp, {
                        x: '56%', y: `${cardY + 1}%`, w: '39%', h: `${cardHeight - 2}%`,
                        fontSize: 12, color: '1E293B', fontFace: 'Arial', valign: 'middle', align: 'left',
                        wrap: true, lineSpacing: 16
                    });
                }
            }

            // Speaker notes
            if (slide.speakerNotes) {
                s.addNotes(slide.speakerNotes);
            }

            // Footer
            s.addText(brand.companyName || 'TrainDash.io', {
                x: '2%', y: '92%', w: '50%', h: '6%',
                fontSize: 9, color: 'AAAAAA', fontFace: 'Arial',
            });
        }
    }

    // Final slide
    const finalSlide = pptx.addSlide();
    finalSlide.background = { color: primaryHex };
    finalSlide.addText('Thank You', {
        x: '5%', y: '35%', w: '90%', h: '15%',
        fontSize: 40, bold: true, color: 'FFFFFF', align: 'center', fontFace: 'Arial',
    });
    finalSlide.addText(brand.companyName || 'TrainDash.io', {
        x: '5%', y: '58%', w: '90%', h: '10%',
        fontSize: 18, color: 'DDDDDD', align: 'center', fontFace: 'Arial',
    });
    const safeTitle = course.title.replace(/[^a-zA-Z0-9_\-]/g, '_').replace(/_+/g, '_');
    await pptx.writeFile({ fileName: `${safeTitle}_Presentation.pptx` });
}
