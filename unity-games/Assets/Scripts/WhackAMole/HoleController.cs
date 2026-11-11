using System.Collections;
using UnityEngine;

namespace WhackAMole
{
    // HoleController: Har ek individual hole ka popup animation, sound aur tap detection handle karta hai
    public class HoleController : MonoBehaviour
    {
        [Header("Components")]
        public SpriteRenderer holeRenderer;
        public GameObject itemContainer;
        public SpriteRenderer itemRenderer;
        public Collider2D itemCollider;

        [Header("State")]
        public bool isOccupied = false;
        private bool isHit = false;
        private ItemData currentData;
        private Coroutine activePopRoutine;

        private Vector3 hiddenLocalPos = new Vector3(0f, -0.3f, 0f);
        private Vector3 visibleLocalPos = new Vector3(0f, 0.25f, 0f);

        void Awake()
        {
            ResetHole();
        }

        public void PopUp(ItemData data, float visibleDuration)
        {
            if (isOccupied) return;

            currentData = data;
            isOccupied = true;
            isHit = false;

            if (activePopRoutine != null)
            {
                StopCoroutine(activePopRoutine);
            }

            activePopRoutine = StartCoroutine(PopRoutine(visibleDuration));
        }

        private IEnumerator PopRoutine(float duration)
        {
            if (itemRenderer != null && currentData != null)
            {
                itemRenderer.sprite = currentData.itemSprite;
                itemRenderer.color = Color.white;
            }

            if (itemContainer != null)
            {
                itemContainer.SetActive(true);
            }

            // 1. Upward animation
            float elapsed = 0f;
            float popTime = 0.15f;
            while (elapsed < popTime)
            {
                elapsed += Time.deltaTime;
                float t = Mathf.Clamp01(elapsed / popTime);
                if (itemContainer != null)
                {
                    itemContainer.transform.localPosition = Vector3.Lerp(hiddenLocalPos, visibleLocalPos, t);
                    itemContainer.transform.localScale = Vector3.Lerp(Vector3.zero, Vector3.one, t);
                }
                yield return null;
            }

            if (itemContainer != null)
            {
                itemContainer.transform.localPosition = visibleLocalPos;
                itemContainer.transform.localScale = Vector3.one;
            }

            // 2. Wait on screen
            yield return new WaitForSeconds(duration);

            // 3. Slide back down if not hit
            if (!isHit)
            {
                elapsed = 0f;
                float hideTime = 0.12f;
                while (elapsed < hideTime)
                {
                    elapsed += Time.deltaTime;
                    float t = Mathf.Clamp01(elapsed / hideTime);
                    if (itemContainer != null)
                    {
                        itemContainer.transform.localPosition = Vector3.Lerp(visibleLocalPos, hiddenLocalPos, t);
                        itemContainer.transform.localScale = Vector3.Lerp(Vector3.one, Vector3.zero, t);
                    }
                    yield return null;
                }
            }

            ResetHole();
        }

        public void OnTapped()
        {
            if (!isOccupied || isHit || currentData == null) return;

            isHit = true;
            bool isGood = currentData.itemType == WhackItemType.Good;

            // Play Sound Effect
            if (isGood)
            {
                SoundEffects.PlayGoodCatch();
            }
            else
            {
                SoundEffects.PlayBadCatch();
            }

            // Notify GameManager
            if (WAM_GameManager.Instance != null)
            {
                WAM_GameManager.Instance.OnItemWhacked(currentData);
            }

            // Visual feedback routine
            StartCoroutine(HitFeedbackRoutine(isGood));
        }

        private IEnumerator HitFeedbackRoutine(bool isGood)
        {
            if (activePopRoutine != null)
            {
                StopCoroutine(activePopRoutine);
            }

            if (itemRenderer != null)
            {
                itemRenderer.color = isGood
                    ? new Color(0.6f, 1f, 0.6f, 0.85f)
                    : new Color(1f, 0.3f, 0.3f, 0.85f);
            }

            float elapsed = 0f;
            float duration = 0.12f;
            Vector3 startScale = itemContainer != null ? itemContainer.transform.localScale : Vector3.one;

            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                float t = Mathf.Clamp01(elapsed / duration);
                if (itemContainer != null)
                {
                    itemContainer.transform.localScale = Vector3.Lerp(startScale, Vector3.zero, t);
                }
                yield return null;
            }

            ResetHole();
        }

        public void ResetHole()
        {
            isOccupied = false;
            isHit = false;
            currentData = null;

            if (itemContainer != null)
            {
                itemContainer.transform.localPosition = hiddenLocalPos;
                itemContainer.transform.localScale = Vector3.zero;
                itemContainer.SetActive(false);
            }
        }
    }
}
