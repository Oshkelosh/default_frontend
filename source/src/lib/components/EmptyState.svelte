<script lang="ts">
	let { message = 'Nothing here yet.' }: { message?: string } = $props();
</script>

<div class="empty-state">
	<p>{message}</p>
</div>
