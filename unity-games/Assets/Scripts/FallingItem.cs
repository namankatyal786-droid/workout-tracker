using UnityEngine;

// ItemType enum: item achha hai ya bura (Good items score badhate hain, Bad items life kam karte hain)
public enum ItemType
{
    Good,
    Bad
}

// FallingItem: Upar se girne wale har item ka script
public class FallingItem : MonoBehaviour
{
    [Header("Item Properties")]
    public ItemType itemType = ItemType.Good;
    public string itemName = "Item";
    public int pointValue = 10;       // Good item pakadne par milne wale points
    public float fallSpeed = 3.5f;    // Niche girne ki raftaar

    [Header("Boundary")]
    public float destroyY = -6.5f;    // Is point ke niche jane par item destroy ho jayega

    void Update()
    {
        // Item ko constant speed se niche girao
        transform.Translate(Vector3.down * fallSpeed * Time.deltaTime, Space.World);

        // Agar screen ke bahar nikal gaya toh memory free karne ke liye destroy karo
        if (transform.position.y < destroyY)
        {
            Destroy(gameObject);
        }
    }
}
