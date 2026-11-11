using UnityEngine;

// SoundEffects: Procedural audio synthesis without any external MP3/WAV assets
// Viva point: Audio clips mathematically generate hote hain (Sine wave & Square wave) 
// taaki game lightweight rahe aur kisi external sound pack ki zaroorat na pade.
public static class SoundEffects
{
    private static AudioClip goodCatchClip;
    private static AudioClip badCatchClip;

    public static void PlayGoodCatch()
    {
        if (goodCatchClip == null)
        {
            goodCatchClip = CreateChimeClip();
        }
        PlayClip(goodCatchClip, 0.65f);
    }

    public static void PlayBadCatch()
    {
        if (badCatchClip == null)
        {
            badCatchClip = CreateBuzzerClip();
        }
        PlayClip(badCatchClip, 0.75f);
    }

    private static void PlayClip(AudioClip clip, float volume)
    {
        if (clip == null) return;

        GameObject soundGo = new GameObject("OneShotAudio");
        AudioSource source = soundGo.AddComponent<AudioSource>();
        source.clip = clip;
        source.volume = volume;
        source.spatialBlend = 0f; // 2D Sound
        source.Play();
        Object.Destroy(soundGo, clip.length + 0.1f);
    }

    // Pleasant two-tone chime for Good catch (E5 -> A5)
    private static AudioClip CreateChimeClip()
    {
        int sampleRate = 44100;
        float duration = 0.20f;
        int samples = (int)(sampleRate * duration);
        float[] data = new float[samples];

        for (int i = 0; i < samples; i++)
        {
            float t = (float)i / sampleRate;
            float freq = t < 0.09f ? 659.25f : 880.0f; // E5 then A5
            float decay = Mathf.Clamp01(1.0f - (t / duration));
            data[i] = Mathf.Sin(2 * Mathf.PI * freq * t) * decay * 0.45f;
        }

        AudioClip clip = AudioClip.Create("GoodChime", samples, 1, sampleRate, false);
        clip.SetData(data, 0);
        return clip;
    }

    // Low buzzer sound for Bad catch (130Hz decaying wave)
    private static AudioClip CreateBuzzerClip()
    {
        int sampleRate = 44100;
        float duration = 0.22f;
        int samples = (int)(sampleRate * duration);
        float[] data = new float[samples];

        for (int i = 0; i < samples; i++)
        {
            float t = (float)i / sampleRate;
            float freq = 130.0f;
            float decay = Mathf.Clamp01(1.0f - (t / duration));
            float wave = Mathf.Sign(Mathf.Sin(2 * Mathf.PI * freq * t));
            data[i] = wave * decay * 0.35f;
        }

        AudioClip clip = AudioClip.Create("BadBuzzer", samples, 1, sampleRate, false);
        clip.SetData(data, 0);
        return clip;
    }
}
