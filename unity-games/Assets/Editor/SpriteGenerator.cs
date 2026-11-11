using System.IO;
using UnityEditor;
using UnityEngine;

// SpriteGenerator: Generates the sleek neon glowing Gym Bag and configures Apple Emoji sprites
// Matching the reference UI screenshots exactly!
public static class SpriteGenerator
{
    private const string SpritesDirectory = "Assets/Sprites";
    private const int Res = 256;

    [MenuItem("Tools/Gym Games/1. Generate Sprites")]
    public static void GenerateAllSprites()
    {
        EnsureDirectory(SpritesDirectory);

        CreateNeonGymBagSprite();
        CreateSleekHoleSprite();
        CreateDarkBackgroundSprite();
        ConfigureAllEmojiSprites();

        AssetDatabase.Refresh();
        Debug.Log("[SpriteGenerator] Neon Gym Bag and all Apple Emoji sprites successfully configured!");
    }

    private static void EnsureDirectory(string path)
    {
        if (!Directory.Exists(path))
        {
            Directory.CreateDirectory(path);
        }
    }

    // =========================================================================
    // NEON GLOWING GYM BAG (Matching the user screenshot exactly!)
    // Neon Cyan border + Yellow handles + "OPEN GYM BAG" neon look
    // =========================================================================
    private static void CreateNeonGymBagSprite()
    {
        Texture2D tex = CreateBaseTexture(Res, Res);

        Color neonCyan = new Color(0.20f, 0.88f, 1.0f);        // #33d9ff bright neon cyan
        Color cyanGlow = new Color(0.10f, 0.50f, 0.75f, 0.45f); // Cyan outer glow
        Color darkBox = new Color(0.06f, 0.08f, 0.10f, 0.95f);  // Dark interior
        Color amberGrip = new Color(1.0f, 0.75f, 0.15f);       // Yellow/amber grips
        Color textCyan = new Color(0.70f, 0.95f, 1.0f);

        Vector2 boxCenter = new Vector2(128, 95);
        Vector2 boxHalf = new Vector2(85, 45);

        for (int y = 0; y < Res; y++)
        {
            for (int x = 0; x < Res; x++)
            {
                Vector2 p = new Vector2(x, y);

                // Main Bag Box
                float dBox = DistRoundedBox(p, boxCenter, boxHalf, 12f);

                // Top Yellow Handle (Curved arch at the top)
                float dHandleOuter = DistRoundedBox(p, new Vector2(128, 155), new Vector2(35, 20), 8f);
                float dHandleInner = DistRoundedBox(p, new Vector2(128, 152), new Vector2(25, 14), 6f);
                float dHandle = Mathf.Max(dHandleOuter, -dHandleInner);

                // Left & Right Yellow Grip Bars
                float dLeftGrip = DistRoundedBox(p, new Vector2(43, 95), new Vector2(4, 25), 3f);
                float dRightGrip = DistRoundedBox(p, new Vector2(213, 95), new Vector2(4, 25), 3f);

                // 1. Draw Yellow Handle
                if (dHandle < 2.0f)
                {
                    float a = Mathf.Clamp01(0.5f - dHandle / 2.0f);
                    BlendPixel(tex, x, y, amberGrip, a);
                }

                // 2. Draw Main Box (Dark body + Neon cyan glowing border)
                if (dBox < 10.0f)
                {
                    // Outer glow
                    if (dBox >= 0f)
                    {
                        float glowAlpha = Mathf.Clamp01(1.0f - (dBox / 10.0f)) * 0.7f;
                        BlendPixel(tex, x, y, cyanGlow, glowAlpha);
                    }
                    else
                    {
                        Color col = darkBox;

                        // Neon border stroke
                        if (dBox > -5.0f)
                        {
                            col = neonCyan;
                        }

                        // Top rim opening (highlight bar)
                        if (Mathf.Abs(y - 138) < 3 && Mathf.Abs(x - 128) < 80)
                        {
                            col = Color.white;
                        }

                        BlendPixel(tex, x, y, col, 1.0f);
                    }
                }

                // 3. Draw Side Amber Grips
                if (dLeftGrip < 1.5f) BlendPixel(tex, x, y, amberGrip, Mathf.Clamp01(0.5f - dLeftGrip / 1.5f));
                if (dRightGrip < 1.5f) BlendPixel(tex, x, y, amberGrip, Mathf.Clamp01(0.5f - dRightGrip / 1.5f));
            }
        }

        // Draw pixel text "OPEN" and "GYM BAG" inside bag
        DrawTextPixel(tex, "OPEN", 102, 115, amberGrip);
        DrawTextPixel(tex, "GYM", 108, 92, textCyan);
        DrawTextPixel(tex, "BAG", 108, 72, textCyan);

        SaveAndConfigureCustomSprite(tex, $"{SpritesDirectory}/gym_bag.png", 120);
    }

    // =========================================================================
    // WHACK-A-MOLE SLEEK HOLE TILE (Matching Image 2 screenshot)
    // =========================================================================
    private static void CreateSleekHoleSprite()
    {
        Texture2D tex = CreateBaseTexture(Res, Res);

        Color tileBg = new Color(0.09f, 0.12f, 0.15f, 0.95f);     // #171f26
        Color tileBorder = new Color(0.18f, 0.24f, 0.30f);        // Subtle bluish-gray border
        Color holeShadow = new Color(0.04f, 0.05f, 0.07f, 0.95f); // Dark inner shadow

        Vector2 center = new Vector2(128, 128);

        for (int y = 0; y < Res; y++)
        {
            for (int x = 0; x < Res; x++)
            {
                Vector2 p = new Vector2(x, y);

                float dTile = DistRoundedBox(p, center, new Vector2(95, 95), 24f);
                float dShadow = DistRoundedBox(p, new Vector2(128, 90), new Vector2(65, 20), 14f);

                if (dTile < 1.5f)
                {
                    float a = Mathf.Clamp01(0.5f - dTile / 1.5f);
                    Color col = tileBg;

                    if (dTile > -4.0f) col = tileBorder;
                    else if (dShadow < 0f) col = holeShadow;

                    BlendPixel(tex, x, y, col, a);
                }
            }
        }

        SaveAndConfigureCustomSprite(tex, $"{SpritesDirectory}/hole.png", 140);
    }

    private static void CreateDarkBackgroundSprite()
    {
        Texture2D tex = CreateBaseTexture(Res, Res);
        Color bg = new Color(0.05f, 0.07f, 0.08f); // Deep dark background #0d1214

        for (int y = 0; y < Res; y++)
        {
            for (int x = 0; x < Res; x++)
            {
                tex.SetPixel(x, y, bg);
            }
        }

        SaveAndConfigureCustomSprite(tex, $"{SpritesDirectory}/background.png", 100);
    }

    // =========================================================================
    // CONFIGURE IMPORTED APPLE EMOJI SPRITES
    // Scaled at 72 Pixels Per Unit for compact, crisp in-game display!
    // =========================================================================
    public static void ConfigureAllEmojiSprites()
    {
        string[] emojiFiles = {
            "dumbbell.png", "banana.png", "apple.png",
            "pizza.png", "burger.png", "cake.png", "heart.png"
        };

        foreach (string file in emojiFiles)
        {
            string path = $"{SpritesDirectory}/{file}";
            if (File.Exists(path))
            {
                AssetDatabase.ImportAsset(path, ImportAssetOptions.ForceUpdate);
                TextureImporter importer = AssetImporter.GetAtPath(path) as TextureImporter;
                if (importer != null)
                {
                    importer.textureType = TextureImporterType.Sprite;
                    importer.spriteImportMode = SpriteImportMode.Single;
                    importer.spritePixelsPerUnit = 72; // Crisp compact size matching screenshot!
                    importer.filterMode = FilterMode.Bilinear;
                    importer.alphaIsTransparency = true;
                    importer.mipmapEnabled = false;
                    importer.textureCompression = TextureImporterCompression.Uncompressed;
                    importer.SaveAndReimport();
                }
            }
        }
    }

    // =========================================================================
    // HELPERS
    // =========================================================================
    private static Texture2D CreateBaseTexture(int w, int h)
    {
        Texture2D tex = new Texture2D(w, h, TextureFormat.RGBA32, false);
        Color[] clear = new Color[w * h];
        for (int i = 0; i < clear.Length; i++) clear[i] = Color.clear;
        tex.SetPixels(clear);
        return tex;
    }

    private static float DistRoundedBox(Vector2 p, Vector2 center, Vector2 halfSize, float radius)
    {
        Vector2 d = new Vector2(Mathf.Abs(p.x - center.x), Mathf.Abs(p.y - center.y)) - halfSize + new Vector2(radius, radius);
        Vector2 clamped = new Vector2(Mathf.Max(d.x, 0f), Mathf.Max(d.y, 0f));
        return clamped.magnitude + Mathf.Min(Mathf.Max(d.x, d.y), 0f) - radius;
    }

    private static void BlendPixel(Texture2D tex, int x, int y, Color src, float alpha)
    {
        if (x < 0 || x >= tex.width || y < 0 || y >= tex.height || alpha <= 0f) return;

        Color dst = tex.GetPixel(x, y);
        float outA = src.a * alpha + dst.a * (1f - src.a * alpha);
        if (outA > 0f)
        {
            Color outCol = (src * (src.a * alpha) + dst * (dst.a * (1f - src.a * alpha))) / outA;
            outCol.a = outA;
            tex.SetPixel(x, y, outCol);
        }
    }

    private static void DrawTextPixel(Texture2D tex, string text, int startX, int startY, Color col)
    {
        int curX = startX;
        foreach (char c in text)
        {
            bool[,] glyph = GetCharGlyph(c);
            if (glyph != null)
            {
                for (int gx = 0; gx < glyph.GetLength(0); gx++)
                {
                    for (int gy = 0; gy < glyph.GetLength(1); gy++)
                    {
                        if (glyph[gx, gy])
                        {
                            tex.SetPixel(curX + gx * 2, startY + (4 - gy) * 2, col);
                            tex.SetPixel(curX + gx * 2 + 1, startY + (4 - gy) * 2, col);
                            tex.SetPixel(curX + gx * 2, startY + (4 - gy) * 2 + 1, col);
                            tex.SetPixel(curX + gx * 2 + 1, startY + (4 - gy) * 2 + 1, col);
                        }
                    }
                }
            }
            curX += 9;
        }
    }

    private static bool[,] GetCharGlyph(char c)
    {
        switch (char.ToUpper(c))
        {
            case 'O': return new bool[,] { { true, true, true, true, true }, { true, false, false, false, true }, { true, true, true, true, true } };
            case 'P': return new bool[,] { { true, true, true, true, true }, { true, false, true, false, false }, { true, true, true, false, false } };
            case 'E': return new bool[,] { { true, true, true, true, true }, { true, false, true, false, true }, { true, false, true, false, true } };
            case 'N': return new bool[,] { { true, true, true, true, true }, { false, true, false, false, false }, { true, true, true, true, true } };
            case 'G': return new bool[,] { { true, true, true, true, true }, { true, false, false, false, true }, { true, false, true, true, true } };
            case 'Y': return new bool[,] { { true, true, false, false, false }, { false, false, true, true, true }, { true, true, false, false, false } };
            case 'M': return new bool[,] { { true, true, true, true, true }, { false, true, false, false, false }, { true, true, true, true, true } };
            case 'B': return new bool[,] { { true, true, true, true, true }, { true, false, true, false, true }, { false, true, false, true, false } };
            case 'A': return new bool[,] { { true, true, true, true, true }, { true, false, true, false, false }, { true, true, true, true, true } };
            default: return null;
        }
    }

    private static void SaveAndConfigureCustomSprite(Texture2D tex, string path, float ppu)
    {
        tex.Apply();
        byte[] bytes = ImageConversion.EncodeToPNG(tex);
        File.WriteAllBytes(path, bytes);

        AssetDatabase.ImportAsset(path, ImportAssetOptions.ForceUpdate);
        TextureImporter importer = AssetImporter.GetAtPath(path) as TextureImporter;
        if (importer != null)
        {
            importer.textureType = TextureImporterType.Sprite;
            importer.spriteImportMode = SpriteImportMode.Single;
            importer.spritePixelsPerUnit = ppu;
            importer.filterMode = FilterMode.Bilinear;
            importer.alphaIsTransparency = true;
            importer.mipmapEnabled = false;
            importer.textureCompression = TextureImporterCompression.Uncompressed;
            importer.SaveAndReimport();
        }
    }
}
