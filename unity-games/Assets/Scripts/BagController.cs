using System.Collections;
using UnityEngine;

// BagController: Gym bag ka movement, collision, visual punch effects aur sounds handle karta hai
public class BagController : MonoBehaviour
{
    [Header("Movement Settings")]
    public float keyboardSpeed = 10f;
    public float minX = -2.4f;
    public float maxX = 2.4f;
    public float fixedY = -4.2f;

    private Camera mainCamera;
    private bool isDragging = false;
    private SpriteRenderer spriteRenderer;
    private Vector3 originalScale;
    private Coroutine activeFeedbackRoutine;

    void Start()
    {
        mainCamera = Camera.main;
        spriteRenderer = GetComponent<SpriteRenderer>();
        originalScale = transform.localScale;

        Vector3 pos = transform.position;
        pos.y = fixedY;
        transform.position = pos;
    }

    void Update()
    {
        if (GameManager.Instance != null && (!GameManager.Instance.IsPlaying))
        {
            return;
        }

        HandleKeyboardInput();
        HandlePointerInput();
        ClampPosition();
    }

    private void HandleKeyboardInput()
    {
        float horizontal = Input.GetAxisRaw("Horizontal");
        if (Mathf.Abs(horizontal) > 0.01f)
        {
            transform.Translate(Vector3.right * horizontal * keyboardSpeed * Time.deltaTime);
        }
    }

    private void HandlePointerInput()
    {
        if (Input.GetMouseButtonDown(0))
        {
            isDragging = true;
        }
        else if (Input.GetMouseButtonUp(0))
        {
            isDragging = false;
        }

        if (isDragging && mainCamera != null)
        {
            Vector3 worldPos = mainCamera.ScreenToWorldPoint(Input.mousePosition);
            Vector3 currentPos = transform.position;
            currentPos.x = Mathf.Lerp(currentPos.x, worldPos.x, 25f * Time.deltaTime);
            transform.position = currentPos;
        }
    }

    private void ClampPosition()
    {
        Vector3 pos = transform.position;
        pos.x = Mathf.Clamp(pos.x, minX, maxX);
        pos.y = fixedY;
        pos.z = 0f;
        transform.position = pos;
    }

    private void OnTriggerEnter2D(Collider2D collision)
    {
        FallingItem item = collision.GetComponent<FallingItem>();
        if (item != null)
        {
            bool isGood = item.itemType == ItemType.Good;

            // 1. Play Sound Effect (Chime for Good, Buzzer for Bad)
            if (isGood)
            {
                SoundEffects.PlayGoodCatch();
            }
            else
            {
                SoundEffects.PlayBadCatch();
            }

            // 2. Play Visual Feedback (Bounce/Squash & Color Flash)
            if (activeFeedbackRoutine != null)
            {
                StopCoroutine(activeFeedbackRoutine);
            }
            activeFeedbackRoutine = StartCoroutine(CatchFeedbackRoutine(isGood));

            // 3. Notify GameManager
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnItemCollected(item);
            }

            Destroy(collision.gameObject);
        }
    }

    // Visual feedback animation on catch
    private IEnumerator CatchFeedbackRoutine(bool isGood)
    {
        if (spriteRenderer == null) yield break;

        Color flashColor = isGood ? new Color(0.6f, 1.0f, 0.75f) : new Color(1.0f, 0.25f, 0.25f);
        spriteRenderer.color = flashColor;

        float elapsed = 0f;
        float duration = 0.16f;

        Vector3 targetScale = isGood
            ? new Vector3(originalScale.x * 1.15f, originalScale.y * 0.88f, originalScale.z) // Squash
            : new Vector3(originalScale.x * 0.90f, originalScale.y * 1.15f, originalScale.z); // Jolt

        while (elapsed < duration)
        {
            elapsed += Time.deltaTime;
            float t = Mathf.Clamp01(elapsed / duration);

            // Scale bounce
            transform.localScale = Vector3.Lerp(targetScale, originalScale, t);
            // Color return
            spriteRenderer.color = Color.Lerp(flashColor, Color.white, t);

            yield return null;
        }

        transform.localScale = originalScale;
        spriteRenderer.color = Color.white;
    }
}
