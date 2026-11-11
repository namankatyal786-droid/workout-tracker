using UnityEngine;

namespace WhackAMole
{
    // Item type: Good (healthy food & weights) vs Bad (junk food)
    public enum WhackItemType
    {
        Good,
        Bad
    }

    // ItemData: ScriptableObject jo har popup item ka data store karta hai
    // Viva point: ScriptableObject use karne se memory save hoti hai kyunki har item instance
    // alag data duplicate karne ki jagah ek shared asset reference use karta hai.
    [CreateAssetMenu(fileName = "NewWhackItem", menuName = "Gym Games/Whack Item Data")]
    public class ItemData : ScriptableObject
    {
        [Header("Item Info")]
        public string itemName = "Item";
        public Sprite itemSprite;
        public WhackItemType itemType = WhackItemType.Good;

        [Header("Score Values")]
        public int points = 10; // Good item par add honge, Bad item par deduct honge
    }
}
