using UnityEngine;
using System.Runtime.InteropServices;

// GameBridge: WebGL build aur React frontend ke beech communication ke liye bridge
public static class GameBridge
{
#if UNITY_WEBGL && !UNITY_EDITOR
    // Native JavaScript function jo GameBridge.jslib mein defined hai
    [DllImport("__Internal")]
    private static extern void SendGameOverToBrowser(string game, int score);
#endif

    // Yeh method game over hone par call hota hai
    public static void SendGameOver(string game, int score)
    {
        Debug.Log($"[GameBridge] Game over event sent: Game={game}, Score={score}");

#if UNITY_WEBGL && !UNITY_EDITOR
        // Browser window ko postMessage ke through data bhejte hain
        SendGameOverToBrowser(game, score);
#else
        // Editor ya standalone mode mein testing ke liye log print karte hain
        Debug.Log("[GameBridge] Running in Editor or Non-WebGL. postMessage skipped.");
#endif
    }
}
